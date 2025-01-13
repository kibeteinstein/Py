from app import create_app


app = create_app()

    # No need for app.run() in production
if __name__== '__main__':
    app.run(debug=True)