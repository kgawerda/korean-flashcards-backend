var express = require("express");
var router = express.Router();
app = express();

const mysql = require("mysql2");

var connection = mysql.createConnection({
  host: "172.17.112.1",
  port: "3306",
  user: "root",
  password: "",
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
connection.query("USE korean_webapp");

const currentDate = new Date().toISOString().split("T")[0];

function calculateDueDate(priority) {
  var date = new Date();
  switch (priority) {
    case -1:
      return date.toISOString().split("T")[0];
    case 0:
      return date.toISOString().split("T")[0];
    case 1:
      date.setDate(date.getDate() + 3);
      return date.toISOString().split("T")[0];
    case 2:
      date.setDate(date.getDate() + 7);
      return date.toISOString().split("T")[0];
    case 3:
      date.setDate(date.getDate() + 14);
      return date.toISOString().split("T")[0];
    case 4:
      date.setDate(date.getDate() + 30);
      return date.toISOString().split("T")[0];
    case 5:
      date.setDate(date.getDate() + 365);
      return date.toISOString().split("T")[0];
  }
}
router.get("/get-new", (req, res) => {
  var last_item_id;
  if (!req.user) res.send("user not logged in");
  else {
    connection.query(
      "SELECT * from flashcards WHERE user_ref_id = " +
        req.user.user_id +
        " ORDER BY flashcard_id DESC LIMIT 1",
      function (err, rows) {
        if (err) next(err);
        if (!rows.length) last_item_id = 0;
        else last_item_id = rows[0].vocabulary_item_ref_id;
        connection.query(
          "SELECT * from vocabulary ORDER BY item_id ASC LIMIT " +
            last_item_id +
            ", 10",
          function (err, rows) {
            if (err) next(err);
            for (let i = 0; i < rows.length; i++) {
              connection.query(
                "INSERT INTO flashcards (due_date, priority, vocabulary_item_ref_id, user_ref_id) VALUES ('" +
                  currentDate +
                  "', -1, " +
                  rows[i].item_id +
                  ", " +
                  req.user.user_id +
                  ")",
                function (err, rows) {
                  if (err) next(err);
                  else res.send("items added");
                }
              );
            }
          }
        );
      }
    );
  }
});

router.get("/get-due", (req, res) => {
  if (!req.user) res.send("user not logged in");
  else {
    connection.query(
      "SELECT * from flashcards WHERE user_ref_id = " +
        req.user.user_id +
        " AND due_date <= '" +
        currentDate +
        "'",
      function (err, rows) {
        if (err) next(err);
        else if (rows.length) res.json(rows);
        else res.send("no items due today");
      }
    );
  }
});

router.get("/get-learning", (req, res) => {
  if (!req.user) res.send("user not logged in");
  else {
    connection.query(
      "SELECT * from flashcards WHERE user_ref_id = " +
        req.user.user_id +
        " AND priority = -1",
      function (err, rows) {
        if (err) next(err);
        else if (rows.length) res.json(rows);
        else res.send("no items in learning");
      }
    );
  }
});

router.post("/succeed-card", (req, res) => {
  if (!req.user) res.send("user not logged in");
  else {
    connection.query(
      "SELECT * from flashcards WHERE user_ref_id = " +
        req.user.user_id +
        " AND flashcard_id = " +
        req.body.flashcard_id +
        "",
      function (err, rows) {
        if (err) next(err);
        if (rows.length) {
          var priority;
          if (rows[0].priority === 5) priority = 5;
          else priority = rows[0].priority + 1;
          var dueDate = calculateDueDate(priority);
          connection.query(
            "UPDATE flashcards SET priority = " +
              priority +
              ", due_date ='" +
              dueDate +
              "' WHERE flashcard_id = " +
              req.body.flashcard_id +
              "",
            function (err, res) {
              if (err) next(err);
              else res.send("card succeeded");
            }
          );
        }
      }
    );
  }
});

router.post("/fail-card", (req, res) => {
  if (!req.user) res.send("user not logged in");
  else {
    connection.query(
      "SELECT * from flashcards WHERE user_ref_id = " +
        req.user.user_id +
        " AND flashcard_id = " +
        req.body.flashcard_id +
        "",
      function (err, rows) {
        if (err) next(err);
        if (rows.length) {
          var priority;
          if (rows[0].priority !== -1 && rows[0].priority !== 0)
            priority = rows[0].priority - 1;
          else priority = rows[0].priority;
          var dueDate = calculateDueDate(priority);
          connection.query(
            "UPDATE flashcards SET priority = " +
              priority +
              ", due_date ='" +
              dueDate +
              "' WHERE flashcard_id = " +
              req.body.flashcard_id +
              "",
            function (err, res) {
              if (err) next(err);
              else res.send("card succeeded");
            }
          );
        }
      }
    );
  }
});

module.exports = router;
