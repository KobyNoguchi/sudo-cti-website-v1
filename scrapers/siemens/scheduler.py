"""
Siemens CERT Scraper Scheduler

Runs the vulnerability scraper on a configurable schedule.
Can run as a background service or be invoked by Windows Task Scheduler.

Usage:
    python scheduler.py                    # Run with default schedule (daily at 6 AM)
    python scheduler.py --interval 12      # Run every 12 hours
    python scheduler.py --run-now          # Run immediately then continue on schedule
    python scheduler.py --once             # Run once and exit (for Task Scheduler)
"""
import argparse
import logging
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import schedule
except ImportError:
    print("Error: 'schedule' package not installed.")
    print("Install with: pip install schedule")
    sys.exit(1)

# Import the scraper
from simple_scraper import run_scraper, export_results, setup_logging

# ============================================================================
# Configuration
# ============================================================================

DEFAULT_SCHEDULE_TIME = "06:00"  # 6 AM daily
DEFAULT_INTERVAL_HOURS = 24

# ============================================================================
# Scheduler Functions
# ============================================================================

def create_scheduler_logger(log_dir: Path) -> logging.Logger:
    """Create a separate logger for the scheduler."""
    log_dir.mkdir(parents=True, exist_ok=True)
    
    logger = logging.getLogger("siemens_scheduler")
    logger.setLevel(logging.DEBUG)
    logger.handlers = []
    
    # File handler
    log_filename = "scheduler.log"
    file_handler = logging.FileHandler(log_dir / log_filename, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter('[%(asctime)s] %(message)s', datefmt='%H:%M:%S')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    return logger


def run_scheduled_scrape(scheduler_logger: logging.Logger, script_dir: Path) -> None:
    """
    Execute a scheduled scrape run.
    
    Args:
        scheduler_logger: Scheduler's logger instance
        script_dir: Path to the scraper script directory
    """
    scheduler_logger.info("=" * 50)
    scheduler_logger.info("Starting scheduled scrape...")
    scheduler_logger.info("=" * 50)
    
    log_dir = script_dir / "logs"
    output_dir = script_dir / "output"
    website_data_path = script_dir.parent.parent / "data" / "siemens-vulnerabilities.json"
    
    # Create scraper logger
    scraper_logger = setup_logging(log_dir, quiet=False)
    
    try:
        # Run scraper
        results = run_scraper(scraper_logger)
        
        if results["vulnerabilities"]:
            # Export results
            export_results(
                results["vulnerabilities"],
                output_dir,
                website_data_path,
                scraper_logger
            )
            
            stats = results["stats"]
            scheduler_logger.info(
                f"Scrape complete: {stats['successful']}/{stats['total_attempted']} successful, "
                f"{stats['total_cves']} CVEs collected"
            )
        else:
            scheduler_logger.error("No vulnerabilities scraped!")
            
    except Exception as e:
        scheduler_logger.exception(f"Scrape failed with error: {e}")
    
    scheduler_logger.info("Next run scheduled per configuration")
    scheduler_logger.info("")


def run_scheduler(
    interval_hours: int = DEFAULT_INTERVAL_HOURS,
    schedule_time: str = None,
    run_immediately: bool = False,
    script_dir: Path = None
) -> None:
    """
    Start the scheduler loop.
    
    Args:
        interval_hours: Hours between runs (used if schedule_time is None)
        schedule_time: Specific time to run daily (e.g., "06:00")
        run_immediately: If True, run once immediately before starting schedule
        script_dir: Path to scraper directory
    """
    if script_dir is None:
        script_dir = Path(__file__).parent
    
    log_dir = script_dir / "logs"
    logger = create_scheduler_logger(log_dir)
    
    logger.info("=" * 60)
    logger.info("Siemens CERT Scraper Scheduler")
    logger.info("=" * 60)
    logger.info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if schedule_time:
        logger.info(f"Schedule: Daily at {schedule_time}")
        schedule.every().day.at(schedule_time).do(
            run_scheduled_scrape, scheduler_logger=logger, script_dir=script_dir
        )
    else:
        logger.info(f"Schedule: Every {interval_hours} hour(s)")
        schedule.every(interval_hours).hours.do(
            run_scheduled_scrape, scheduler_logger=logger, script_dir=script_dir
        )
    
    logger.info("Press Ctrl+C to stop")
    logger.info("")
    
    # Run immediately if requested
    if run_immediately:
        logger.info("Running initial scrape now...")
        run_scheduled_scrape(logger, script_dir)
    
    # Main scheduler loop
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logger.info("\nScheduler stopped by user")


def run_once(script_dir: Path = None) -> int:
    """
    Run the scraper once and exit.
    Suitable for Windows Task Scheduler or cron jobs.
    
    Args:
        script_dir: Path to scraper directory
    
    Returns:
        Exit code (0 for success, non-zero for failure)
    """
    if script_dir is None:
        script_dir = Path(__file__).parent
    
    log_dir = script_dir / "logs"
    logger = create_scheduler_logger(log_dir)
    
    logger.info("Running one-time scrape (Task Scheduler mode)...")
    
    try:
        run_scheduled_scrape(logger, script_dir)
        return 0
    except Exception as e:
        logger.exception(f"Scrape failed: {e}")
        return 1


def main():
    """Main entry point with CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Schedule Siemens vulnerability scraper runs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scheduler.py                    # Run daily at 6 AM
  python scheduler.py --time 08:30       # Run daily at 8:30 AM
  python scheduler.py --interval 6       # Run every 6 hours
  python scheduler.py --run-now          # Run immediately, then continue schedule
  python scheduler.py --once             # Run once and exit (for Task Scheduler)
        """
    )
    
    parser.add_argument(
        '--interval', '-i',
        type=int,
        default=None,
        help='Hours between scraper runs (default: 24)'
    )
    parser.add_argument(
        '--time', '-t',
        type=str,
        default=DEFAULT_SCHEDULE_TIME,
        help=f'Time to run daily in HH:MM format (default: {DEFAULT_SCHEDULE_TIME})'
    )
    parser.add_argument(
        '--run-now', '-n',
        action='store_true',
        help='Run the scraper immediately before starting the schedule'
    )
    parser.add_argument(
        '--once', '-1',
        action='store_true',
        help='Run once and exit (for use with Windows Task Scheduler)'
    )
    
    args = parser.parse_args()
    script_dir = Path(__file__).parent
    
    # One-time run mode (for Task Scheduler)
    if args.once:
        exit_code = run_once(script_dir)
        sys.exit(exit_code)
    
    # Continuous scheduler mode
    if args.interval:
        # Use interval-based scheduling
        run_scheduler(
            interval_hours=args.interval,
            schedule_time=None,
            run_immediately=args.run_now,
            script_dir=script_dir
        )
    else:
        # Use time-based scheduling
        run_scheduler(
            schedule_time=args.time,
            run_immediately=args.run_now,
            script_dir=script_dir
        )


if __name__ == "__main__":
    main()
