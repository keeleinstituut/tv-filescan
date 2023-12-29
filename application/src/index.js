require('dotenv').config()

const config = require('./config')
const { makeServer } = require('./server')


const PORT = process.env.APP_PORT || 3000;

async function main() {
    try {
        const server = await makeServer(config)

        server.listen(PORT, () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log(`Server started on PORT: ${PORT}`);
            }
        });
    } catch (e) {
        console.log(e.message)
        throw e
    }
}

main()