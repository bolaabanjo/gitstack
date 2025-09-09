def cli() -> None:
    """Command line interface for gitstack."""
    import argparse
    import sys

    from gitstack import __version__
    from gitstack.gitstack import GitStack

    parser = argparse.ArgumentParser(
        description="GitStack: Manage multiple Git repositories easily."
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"gitstack {__version__}",
        help="Show the version of gitstack and exit.",
    )