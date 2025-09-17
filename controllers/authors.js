const { AuthorModel, authorSchema }= require('./../models/Author');
const { respond, handleError } = require('./../middleware/responseFormatter')

module.exports = {
  search,
  getById,
  getRandom,
  update,
  // create,
  // remove,
  schemas: {
    author: authorSchema,
  }
}

// Get all brands
async function search (req, res) {
  try {
    const { filter, options } = AuthorModel.parseQuery(req.query);
    const found = await AuthorModel.paginate(filter, options);
    const data = {
      totalDocs: found.totalDocs,
      limit: found.limit,
      totalPages: found.totalPages,
      page: found.page,
      pagingCounter: found.pagingCounter,
      hasPrevPage: found.hasPrevPage,
      hasNextPage: found.hasNextPage,
      prevPage: found.prevPage,
      nextPage: found.nextPage,
      docs: found.docs.map((x) => x.format())
    }
    const message = `Found ${data.length} authors matching your query.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// Get a single brand by ID
async function getById (req, res) {
  try {
    const { author_id } = req.params;
    const author = await AuthorModel.findById(author_id);

    if (!author) {
      const message = `Author document with id: ${author_id} not found.`;
      return respond(req, res).notFound({ message });
    }

    const message = `Found author document with id: ${author_id}`;
    const data = author;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

async function getRandom (req, res) {
  try {
    const size = Number.isInteger(parseInt(req.query?.size)) ? parseInt(req.query?.size) : 1
    const data = await AuthorModel.aggregate([{ $sample: { size } }])
    const message = `Found ${data.length} authors matching your query.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

async function update (req, res) {
  try {
    const { author_id } = req.params;
    const found = await AuthorModel.findById(author_id);

    if (!found) {
      const message = `Author document with id: ${author_id} not found.`;
      return respond(req, res).notFound({ message });
    }

    const body = AuthorModel.parseInput(req.body);
    
    found.patch(body)
    const updated = await found.save();

    const message = `Updated author document with id: ${author_id}`;
    const data = updated
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// async function create (req, res) {
//   try {
//     const body = AuthorModel.parseInput(req.body);
//     const author = new AuthorModel(body);
//     const data = await author.save();
//     const message = `Created new author document with id: ${author.id}.`;
//     respond(req, res).created({ message, data });
//   } catch (error) {
//     handleError(req, res, error);
//   }
// }

// async function remove (req, res) {
//   try {
//     const { author_id } = req.params;
//     const removed = await AuthorModel.findByIdAndDelete(author_id);
//     const data = removed.format();
//     const message = `Deleted author document with id=${author_id}`;
//     respond(req, res).ok({ message, data })
//   } catch (error) {
//     handleError(req, res, error);
//   }
// }