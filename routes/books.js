var express = require("express");
var router = express.Router();
var Book = require("../models").Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}

/* Create Not Found error object */
function createNotFoundError(message = "Not Found") {
  const error = new Error(message);
  error.status = 404;
  return error;
}

/* GET full list of books. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render("books/index", { books, title: "Book List" });
  })
);

/* GET form for new book. */
router.get("/new", async function (req, res) {
  res.render("books/new-book", { book: {}, title: "New Book" });
});

/* POST create new book. */
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("books/new-book", {
          book,
          title: "New Book",
          errors: error.errors,
        });
      } else {
        throw error;
      }
    }
  })
);

/* GET update form of one book. */
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/update-book", { book, title: "Update Book" });
    } else {
      next(createNotFoundError());
    }
  })
);

/* POST update book. */
router.post(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const bookId = req.params.id;
    let book = await Book.findByPk(req.params.id);

    try {
      if (book) {
        await book.update(req.body);
        res.redirect("/books/" + bookId);
      } else {
        next(createNotFoundError());
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = bookId;
        res.render("books/update-book", {
          book,
          title: "Update Book",
          errors: error.errors,
        });
      } else {
        throw error;
      }
    }
  })
);

/* POST delete book. */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/");
    } else {
      next(createNotFoundError());
    }
  })
);

module.exports = router;
