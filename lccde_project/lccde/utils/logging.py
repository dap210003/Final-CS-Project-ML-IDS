import logging
from pathlib import Path


def get_logger(name: str = "lccde", level: int = logging.INFO, logfile: Path | None = None) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
    logger.setLevel(level)
    fmt = logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s", datefmt="%H:%M:%S")

    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    if logfile:
        fh = logging.FileHandler(logfile)
        fh.setFormatter(fmt)
        logger.addHandler(fh)

    return logger
