'use client'

import { User, Shield, FileText, Award } from 'lucide-react'

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
              <User className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                Leadership
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Team
            </h1>
          </div>
        </div>
      </section>

      {/* Leader Profile */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Koby Noguchi</h2>
              <p className="text-cyan-400 text-lg">Founder & Cyber Threat Intelligence Analyst</p>
            </div>

            {/* About */}
            <div className="mb-8">
              <p className="text-slate-300 leading-relaxed mb-4">
                Cyber Threat Intelligence Analyst focused on safeguarding both Enterprise and Critical 
                National Infrastructure against Advanced Persistent Threats. Knowledge base includes a 
                foundation of CTI writing, threat hunting over email, network and file systems, OSINT 
                gathering and basic Web Penetration Testing.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Always keeping up to date with CTI feeds to better understand the ever evolving threat 
                landscape in Operational Technology and Critical Network Infrastructure. Contributes to 
                organizational security posture by delivering a variety of security products around 
                intelligence reporting as well as hypothesis and tactical based threat hunts.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Regularly collaborates with cross-functional teams to analyze indicators of compromise, 
                verify that appropriate threat detection is in place, and deploy effective countermeasures. 
                Ethical hacker on ProjectDiscovery, HackerOne & Bugcrowd.
              </p>
            </div>

            {/* Experience Sections */}
            <div className="space-y-8">
              {/* CTI Experience */}
              <div className="border-t border-slate-700 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Cyber Threat Intelligence</h3>
                </div>
                <p className="text-slate-400 mb-4">
                  Researched and crafted intelligence reports around Nation State APTs and eCrime groups 
                  targeting Energy, Government, Military and US/UK Infrastructure. Conducted research and 
                  provided recommendations for tactical as well as hypothesis based threat hunts for 
                  different vulnerabilities, malware injection techniques & the latest CVEs.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Intelligence Products</h4>
                    <ul className="text-slate-400 text-sm space-y-1">
                      <li>• Threat Alerts & Advisories</li>
                      <li>• Vendor Threat Assessments</li>
                      <li>• Weekly & Monthly Intelligence Reports</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Threat Hunts</h4>
                    <ul className="text-slate-400 text-sm space-y-1">
                      <li>• Tactical hunts on Russian and Chinese APT IOCs/TTPs</li>
                      <li>• Hypothesis hunts with open-ended security problems</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* GRC Experience */}
              <div className="border-t border-slate-700 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Governance, Risk & Compliance</h3>
                </div>
                <p className="text-slate-400 mb-4">
                  Worked with various business units to verify vendor compliance with Baseline Security 
                  Requirements. Provided security direction to projects and communicated requirements to 
                  both technical and non-technical stakeholders. Researched and wrote corporate policy 
                  for data sanitization across decommissioned devices and legacy media storage.
                </p>
                <ul className="text-slate-400 text-sm space-y-2">
                  <li>• Evaluated vendor compliance with SOC2 and ISO27001 reports for alignment with NERC CIP, HIPAA, and state/federal legislation</li>
                  <li>• Defined baseline security requirements for solution effectiveness in production</li>
                  <li>• Prioritized and remediated vulnerabilities based on risk assessment</li>
                  <li>• Gathered evidence to verify service integration and documented compliance</li>
                </ul>
              </div>

              {/* SANS Certifications */}
              <div className="border-t border-slate-700 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-orange-400" />
                  <h3 className="text-xl font-semibold text-white">SANS Training</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-white font-medium">SEC595</p>
                    <p className="text-slate-400 text-sm">Applied Data Science and AI/Machine Learning for Cybersecurity Professionals</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-white font-medium">FOR578</p>
                    <p className="text-slate-400 text-sm">Cyber Threat Intelligence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

