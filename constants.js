const port = process.env.PORT || 5000;

const JWT_SECRET = 'Hello$%789';

const mongoURI = "mongodb+srv://dbUser:4F_E$$4T.nLSneb@cluster0.99wh3.mongodb.net/gurukul-bytes?retryWrites=true&w=majority"

exports.port = port;
exports.mongoURI=mongoURI;
exports.JWT_SECRET=JWT_SECRET;