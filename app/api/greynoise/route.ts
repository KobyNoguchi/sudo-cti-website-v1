import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';
import type { ParsedDescription, GreyNoiseReference, GreyNoiseItem, TransformedGreyNoiseFeed } from '@/lib/ai/types';

// Helper function to parse HTML content within the description
function parseDescriptionHtml(htmlContent: string): ParsedDescription {
  try {
    const $ = cheerio.load(htmlContent);

    // Extract summary text (first <p> tag typically)
    const summaryText = $('p').first().text().trim() || null;

    // Extract category, intention, recommendBlock from list items
    let category: string | null = null;
    let intention: string | null = null;
    let recommendBlock: boolean | null = null;
    const references: GreyNoiseReference[] = [];

    $('ul > li').each((_idx, elem) => {
      const strongText = $(elem).find('strong').text().trim();
      const fullText = $(elem).text().trim();

      if (strongText.startsWith('Category:')) {
        category = fullText.replace('Category:', '').trim() || null;
      }
      if (strongText.startsWith('Intention:')) {
        intention = fullText.replace('Intention:', '').trim().toLowerCase() || null;
        if ($(elem).hasClass('benign')) intention = 'benign';
        if ($(elem).hasClass('malicious')) intention = 'malicious';
      }
      if (strongText.startsWith('Recommend Block:')) {
        const blockText = fullText.replace('Recommend Block:', '').trim().toLowerCase();
        recommendBlock = blockText === 'true';
      }
      if (strongText.startsWith('References:')) {
        $(elem).find('a').each((_refIdx, refElem) => {
          references.push({
            text: $(refElem).text().trim() || null,
            url: $(refElem).attr('href') || null,
          });
        });
      }
    });

    return {
      summaryText,
      category,
      intention,
      recommendBlock,
      references,
      rawHtml: htmlContent,
    };
  } catch (error) {
    console.error('GREYNOISE API: Error parsing description HTML:', error);
    return {
      summaryText: 'Error parsing description.',
      category: null,
      intention: null,
      recommendBlock: null,
      references: [],
      rawHtml: htmlContent, 
    };
  }
}

// Revalidate every hour
export const revalidate = 3600;

interface RawFeedItem {
  title?: any; 
  link?: any;  
  pubdate?: any;
  description?: any; 
  guid?: any; 
  [key: string]: any;
}

export async function GET() {
  console.log('GREYNOISE API: Received request');
  try {
    const response = await fetch('https://feeds.labs.greynoise.io/index.rss.xml', {
      next: { revalidate: 3600 },
    });
    console.log('GREYNOISE API: Fetched RSS feed, status:', response.status);

    if (!response.ok) {
      console.error('GREYNOISE API: Failed to fetch GreyNoise RSS feed', { status: response.status, statusText: response.statusText });
      return NextResponse.json({ error: 'Failed to fetch GreyNoise RSS feed', details: response.statusText }, { status: response.status });
    }

    const xmlText = await response.text();

    let parsedXml;
    try {
      parsedXml = await parseStringPromise(xmlText, { 
        explicitArray: false, 
        trim: true, 
        strict: false,
        xmlns: true,
        tagNameProcessors: [str => str.toLowerCase()],
        attrNameProcessors: [str => str.toLowerCase()]
      });
    } catch (parseError) {
      console.error('GREYNOISE API: Error parsing XML string:', parseError);
      return NextResponse.json({ error: 'Failed to parse GreyNoise XML', details: (parseError as Error).message }, { status: 500 });
    }
    
    const rdfNode = parsedXml['rdf:rdf'];
    const rssNode = parsedXml.rss;
    
    let channelNode: any;

    if (rdfNode && rdfNode.channel) {
      channelNode = rdfNode.channel;
    } else if (rssNode && rssNode.channel) {
      channelNode = rssNode.channel;
    } else {
      console.error('GREYNOISE API: Critical XML structure error.');
      return NextResponse.json({ error: 'Unexpected GreyNoise XML structure: Missing channel object' }, { status: 500 });
    }

    const itemsFromFeed: RawFeedItem[] = Array.isArray(channelNode?.item) 
      ? channelNode.item 
      : channelNode?.item ? [channelNode.item] : [];

    const transformedItems: GreyNoiseItem[] = itemsFromFeed.map((item: RawFeedItem, index: number) => {
      try {
        const descriptionHtml = (typeof item.description === 'object' && item.description !== null && typeof (item.description as any)._ === 'string') 
          ? (item.description as any)._ 
          : (typeof item.description === 'string' ? item.description : '');
        
        const parsedDescription = parseDescriptionHtml(descriptionHtml);
        
        let guid: string;
        if (typeof item.guid === 'object' && item.guid && typeof (item.guid as any)._ === 'string') {
          guid = (item.guid as any)._;
        } else if (typeof item.guid === 'string') {
          guid = item.guid;
        } else {
          guid = `item-${index}`;
        }

        const currentTitle = (typeof item.title === 'object' && item.title !== null && typeof (item.title as any)._ === 'string') ? (item.title as any)._ : (typeof item.title === 'string' ? item.title : undefined);
        const currentLink = (typeof item.link === 'object' && item.link !== null && typeof (item.link as any)._ === 'string') ? (item.link as any)._ : (typeof item.link === 'string' ? item.link : undefined);
        const currentPubDate = (typeof item.pubdate === 'object' && item.pubdate !== null && typeof (item.pubdate as any)._ === 'string') ? (item.pubdate as any)._ : (typeof item.pubdate === 'string' ? item.pubdate : undefined);

        if (!currentTitle || !currentLink || !currentPubDate) {
          return null; 
        }

        return {
          title: currentTitle,
          link: currentLink,
          pubDate: currentPubDate,
          guid: guid,
          description: parsedDescription,
        };
      } catch (mapError) {
        console.error(`GREYNOISE API: Error processing item ${index + 1}:`, mapError); 
        return null; 
      }
    }).filter((item): item is GreyNoiseItem => item !== null);

    const feedResult: TransformedGreyNoiseFeed = {
      feedTitle: (typeof channelNode?.title === 'object' && channelNode?.title !== null && typeof (channelNode.title as any)._ === 'string') ? (channelNode.title as any)._ : (typeof channelNode?.title === 'string' ? channelNode.title : 'GreyNoise Feed'),
      feedLink: (typeof channelNode?.link === 'object' && channelNode?.link !== null && typeof (channelNode.link as any)._ === 'string') ? (channelNode.link as any)._ : (typeof channelNode?.link === 'string' ? channelNode.link : ''),
      feedDescription: (typeof channelNode?.description === 'object' && channelNode?.description !== null && typeof (channelNode.description as any)._ === 'string') ? (channelNode.description as any)._ : (typeof channelNode?.description === 'string' ? channelNode.description : ''),
      items: transformedItems,
    };

    return NextResponse.json(feedResult);
  } catch (error: any) {
    console.error('GREYNOISE API: Unhandled error in GET handler:', error);
    return NextResponse.json({ error: 'Failed to process GreyNoise feed', details: error.message }, { status: 500 });
  }
}


