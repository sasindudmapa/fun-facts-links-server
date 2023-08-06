import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";

//APP CONFIG
dotenv.config();
const app = express();
const port = 9000;
const concatUrl = process.env.CONCAT_URL;

//APP CONFIG
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

//DB CONFIG
const passwordDb = process.env.DB_PASSWORD;
const url = `mongodb+srv://factpotlinks:${passwordDb}@cluster0.xaros3w.mongodb.net/?retryWrites=true&w=majority`;
const localUrl = `mongodb://127.0.0.1:27017/LinkDb`;

//Db Collections
const linkSchema = new mongoose.Schema({
  idname: String,
  link: String,
});

const Link = mongoose.model("Link", linkSchema);

//ROUTES
app.get("/", (req, res) => {
  res.send("working");
});

//SAVING AND GENERATING A LINK
app.post("/post/link", (req, res) => {
  //accessing data from client
  const { name, link } = req.body;

  //function for fetching the already existing links from the user submited link nam
  async function getLinks(name) {
    const links = Link.find({ idname: name });
    return links;
  }

  getLinks(name).then((foundLinks) => {
    if (foundLinks.length !== 0) {
      //Already existing links
      res.status(202).send("Link Already Exist");
    } else {
      //no existing links

      const newLink = new Link({
        idname: name,
        link: link,
      });

      //saving the new link
      newLink.save().then(() => {
        const dataToF = {
          generatedLink: `${concatUrl}/${name}`,
        };

        //sending the customized url to the client
        res.status(201).send(dataToF);
      });
    }
  });
});

//FETCHING THE LINK
app.get("/get/link/:name", (req, res) => {
  const { name } = req.params;

  //finding link from the name user provided
  async function getLinks(name) {
    const links = Link.find({ idname: name });
    return links;
  }

  getLinks(name).then((foundLinks) => {
    if (foundLinks.length === 0) {
      //No Existing links from that name
      res.status(202).send("No Existing links from that name");
    } else {
      //sending found link to the user
      const dataToF = {
        link: foundLinks[0].link,
      };

      res.status(200).send(dataToF);
    }
  });
});

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to the database");
    app.listen(port, () => {
      console.log(`server has started on port ${port}`);
    });
  });
