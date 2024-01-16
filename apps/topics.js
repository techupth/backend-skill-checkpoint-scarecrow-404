import { ObjectId } from "mongodb";
import { db } from "../utils/db.js";
import { Router } from "express";

const topicsRouter = Router();
const collection = db.collection("topics");

topicsRouter.get("/", async (req, res) => {
  const query = {};
  if (!req.query.name || !req.query.category) {
    query;
  }
  if (req.query.name) {
    query.name = new RegExp(req.query.name, "ig");
  }
  if (req.query.category) {
    query.category = { $all: req.query.category.split(",") };
  }
  try {
    const topics = await collection
      .find(query)
      .sort({ create_time: -1 })
      .toArray();
    return res.json({
      data: topics,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Topics has been failed to fetch ${err}`,
    });
  }
});

topicsRouter.get("/:topicsId", async (req, res) => {
  const topicsId = new ObjectId(req.params.topicsId);
  try {
    const topic = await collection.findOne({ _id: topicsId });
    return res.json({
      message: `Topics Id : ${topicsId} has been fetch successfully`,
      data: topic,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Topics Id : ${topicsId} has been failed to fetch `,
    });
  }
});

topicsRouter.post("/", async (req, res) => {
  const { name, category, description } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({
      message: "invalid input",
    });
  }
  const newTopic = {
    name,
    category,
    description,
    votes: {
      upvotes: 0,
      downvotes: 0,
    },
  };
  try {
    await collection.insertOne({ ...newTopic, create_time: new Date() });
    return res.json({
      message: "inserted new topic successfully",
    });
  } catch (err) {
    return res.status(400).json({
      message: `Error can't insert new topic : ${err} `,
    });
  }
});

topicsRouter.put("/:topicsId", async (req, res) => {
  const id = new ObjectId(req.params.topicsId);
  const { name, category, description } = req.body;
  const newData = {
    name,
    category,
    description,
  };
  try {
    await collection.updateOne({ _id: id }, { $set: newData });
    return res.json({
      message: "this topic updated successfully",
    });
  } catch (err) {
    return res.status(400).json({
      message: `this topic failed to update: ${err}`,
    });
  }
});

topicsRouter.delete("/:topicsId", async (req, res) => {
  const id = req.params.topicsId;
  try {
    await collection.deleteOne({ _id: id });
  } catch (err) {
    return res.status(500).json({
      message: `this topic failed to delete: ${err}`,
    });
  }
  try {
    const answerCollection = db.collection("answers");
    await answerCollection.deleteMany({ topic_id: id });
    return res.json({
      message: `topic : (${id}) has been deleted with it answer`,
    });
  } catch (err) {
    return res.status(500).json({
      message: `this topic's answer failed to delete: ${err}`,
    });
  }
});
topicsRouter.patch("/:topicsId/vote", async (req, res) => {
  const { voteType } = req.body;

  if (!["upvote", "downvote"].includes(voteType)) {
    return res.status(400).json({
      message: "Invalid voteType. It should be 'upvote' or 'downvote'.",
    });
  }

  const topicsId = new ObjectId(req.params.topicsId);

  try {
    const updateField = `votes.${voteType}s`;

    const updateQuery = { $inc: { [updateField]: 1 } };

    const result = await collection.updateOne({ _id: topicsId }, updateQuery);

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "Topic not found.",
      });
    }

    return res.json({
      message: `${voteType} successful for answer with ID ${topicsId}`,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Failed to ${voteType} the answer. Error: ${err}`,
    });
  }
});

export default topicsRouter;
