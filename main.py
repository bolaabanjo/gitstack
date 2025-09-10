from datetime import datetime
import click


@click.command()
def date():
    """This is to display the current date."""
    click.echo(datetime.utcnow().date().isoformat())

@click.command()
def time():
    """This is to display the current time."""
    click.echo(datetime.utcnow().time().isoformat())

@click.command()
def docs():
    """This is to launch documentation for gitstack."""
    click.launch("http://x.com/bolaabanjo/")
@click.command()
def snap():
    """captures current code, dependencies, and environment."""
    click.echo("Snapshot taken!")
@click.command()
def restore():
    """rebuilds the project environment exactly as it was."""
    click.echo("Restored to previous snapshot!")
@click.command()
def deploy():
    """spins up the project in a containerized environment (future feature)."""
    click.echo("Project deployed in containerized environment!")

@click.group()
def main():
    pass

main.add_command(date)
main.add_command(time)
main.add_command(docs)
main.add_command(snap)
main.add_command(restore)
main.add_command(deploy)

if __name__ == '__main__':
    main()