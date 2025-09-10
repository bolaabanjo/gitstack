import click 

@click.command()
#@click.option('--name', '-n', default='Bola', help='Input your First Name')

@click.option('--name', '-n', default='Bola', help='Input your First Name')

def main(name):
    click.echo("Hello, World, My name is {}".format(name))

if __name__ == '__main__':
    main()