import click

@click.command()
@click.argument('number1', type=int)
@click.argument('number2', type=int)
@click.argument('method', default='add')

def main(number1, number2, method):
    if method == 'add':
        result = number1 + number2
    elif method == 'subtract':
        result = number1 - number2
    elif method == 'multiply':
        result = number1 * number2
    click.echo(result)

if __name__ == '__main__':
    main()