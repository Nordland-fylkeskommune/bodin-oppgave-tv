# Run the server by typing npm run dev

# docker stuff

# to build the docker image, run

    docker build -t bodintv .

# to create a network for the containers to communicate, run

    docker network create bodin-oppgavetv-app

# to create a volume for the database, run

    docker volume create bodin-oppgavetv-app

# to build the mysql container, run

    docker run -d -p  --network bodin-oppgavetv-app --network-alias bodin-oppgavetv-sql -v bodin-oppgavetv-app:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=oppgavetv mysql:5.7

# to run the app container, run

    docker run -dp 3000:3000 -v "bodin-oppgavetv-app:/app" --network bodin-oppgavetv-app -e DATABASE_URL=mysql://root:secret@bodin-oppgavetv-sql:3306/oppgavetv bodintv
