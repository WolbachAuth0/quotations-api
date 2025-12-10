const { QuotationModel, quotationSchema }= require('./../models/Quotation');
const { respond, handleError } = require('./../middleware/responseFormatter')

module.exports = {
  search,
  getById,
  getRandom,
  update,
  create,
  remove,
  schemas: {
    quotation: quotationSchema,
  }
}

// Search Quotations
async function search (req, res) {
  try {
    const { filter, options } = QuotationModel.parseQuery(req.query);
    const found = await QuotationModel.paginate(filter, options);
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
    const message = `Found ${data.length} quotations matching your query.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// Get a single Quotation by ID
async function getById (req, res) {
  try {
    const { quotation_id } = req.params;
    const quotation = await QuotationModel.findById(quotation_id);

    if (!quotation) {
      const message = `Quotation document with id: ${quotation_id} not found.`;
      return respond(req, res).notFound({ message });
    }

    const message = `Found quotation document with id: ${quotation_id}`;
    const data = quotation;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// Get a single Quotation at random
async function getRandom (req, res) {
  try {
    const size = Number.isInteger(parseInt(req.query?.size)) ? parseInt(req.query?.size) : 1
    const data = await QuotationModel.aggregate([{ $sample: { size } }])
    const message = `Found ${data.length} quotations matching your query.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// Update a Quotation by ID
async function update (req, res) {
  try {
    const { quotation_id } = req.params;
    const found = await QuotationModel.findById(quotation_id);

    if (!found) {
      const message = `Quotation document with id: ${quotation_id} not found.`;
      return respond(req, res).notFound({ message });
    }

    const body = QuotationModel.parseInput(req.body);
    
    found.patch(body)
    const updated = await found.save();

    const message = `Updated quotation document with id: ${quotation_id}`;
    const data = updated
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// Add a Quotation to the database
async function create (req, res) {
  try {
    const body = QuotationModel.parseInput(req.body);
    const quotation = new QuotationModel(body);
    const data = await quotation.save();
    const message = `Created new quotation document with id: ${quotation.id}.`;
    respond(req, res).created({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
}

// Delete a Quotation from the Database.
async function remove (req, res) {
  try {
    const { quotation_id } = req.params;
    const removed = await QuotationModel.findByIdAndDelete(quotation_id);
    const data = removed.format();
    const message = `Deleted quotation document with id=${quotation_id}`;
    respond(req, res).ok({ message, data })
  } catch (error) {
    handleError(req, res, error);
  }
}