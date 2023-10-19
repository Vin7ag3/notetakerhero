// import req.
const exp = require('constants');
const express = require('express');
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");

// set port for server + exp app
const PORT = process.env.PORT || 3000;
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// route to serve the index.html
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// route to serve the notes.html
app.get("/notes", (req, res) => res.sendFile(path.join(__dirname, "public", "notes.html")));

// read the notes fro db.json send as json
app.get("/api/notes", (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "db.json"), "utf-8"));
    res.json(data);
});

// handle creation of new notes
app.post("/api/notes", (req, res) => {
    const { title, text } = req.body;
    if (title && text ) {
        const newNote = { title, text, id: uniqid() };
        const existingNotes = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "db.json"), "utf-8"));
        existingNotes.push(newNote);
        writeDataToJson(path.join(__dirname, "db", "db.json"), existingNotes, res);
    } else {
        res.status(400).send("bad request")
    }
});

// handle the deletion of notes by id
app.delete("/api/notes/:id", (req, res) => {
    const id = req.params.id;
    const existingNotes = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "db.json"), "utf-8"));
    const filteredNotes = existingNotes.filter((note) => note.id !== id);
    writeDataToJson(path.join(__dirname, "db", "db.json"), filteredNotes, res);
});

// write data to json - handle resp.
const writeDataToJson = (file, data, response) => {
    fs.writeFile(file, JSON.stringify(data, null, 4), (err) => {
        if (err) {
            console.error(err);
            response.status(500).send("Internal server errror");
        } else {
            console.info(`data written to ${file}`);
            response.status(200).send("success");
        }
    });
};

app.listen(PORT, () =>
    console.log(`listening at http://localhost:${PORT}`)
);