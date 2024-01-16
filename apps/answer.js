import { ObjectId } from "mongodb";
import { db } from "../utils/db.js";
import { Router } from "express";

const answersRouter = Router();
const collection = db.collection("answers");

answersRouter.get("/:topicsId/answers", async (req, res) => {
  //   if (!req.params.topicsId) {
  //     return res.status(400).json({
  //       message: "error there is no Id of topic to fetch",
  //     });
  //   }
  const topicsId = req.params.topicsId;
  const query = {
    topic_id: topicsId,
  };
  try {
    const result = await collection
      .find(query)
      .sort({ create_time: -1 })
      .toArray();

    return res.json({
      message: "Fetch answer successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: `error failed to fetch answer : ${err}`,
    });
  }
});

answersRouter.get("/:topicsId/answers/:answerId", async (req, res) => {
  const id = new ObjectId(req.params.answerId);
  const topicsId = new ObjectId(req.params.topicsId);
  const query = {
    _id: id,
    topic_id: topicsId,
  };

  try {
    if (collection.countDocuments(query) === 0) {
      return res.status(400).json({
        message: `there is no answer to this exact id: ${id}`,
      });
    }
    const result = await collection.findOne(query);
    return res.json({
      message: "fetch answer successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: `failed to fetch data error: ${err}`,
    });
  }
});

answersRouter.post("/:topicsId/answers", async (req, res) => {
  if (!req.body.description) {
    return res.status(400).json({
      message: "error there is no Id of topic to post",
    });
  }
  if (req.body.description.length > 300) {
    return res.status(413).json({
      message: `payloaad too large it contain: ${req.body.description.length} expect <= 300`,
    });
  }
  console.log(req.params.topicsId);
  if (!req.params.topicsId) {
    return res.status(400).json({
      message: "error there is no Id of topic to post",
    });
  }
  const description = req.body.description;
  const topicsId = req.params.topicsId;
  try {
    await collection.insertOne({
      topic_id: topicsId,
      description,
      votes: {
        upvotes: 0,
        downvotes: 0,
      },
      create_time: new Date(),
    });
    return res.json({
      message: `answer to this topic has been added successfully`,
    });
  } catch (err) {
    return res.status(500).json({
      message: `failed to add an answer error: ${err}`,
    });
  }
});

answersRouter.put("/:topicsId/answers/:answerId", async (req, res) => {
  const topicsId = req.params.topicsId;
  const id = new ObjectId(req.params.answerId);
  const description = req.body.description;
  const newData = {
    category,
  };
  try {
    await collection.updateOne(
      { _id: id, topic_id: topicsId },
      { $set: newData }
    );
    return res.json({
      message: "this answer updated successfully",
    });
  } catch (err) {
    return res.status(400).json({
      message: `this topic failed to update: ${err}`,
    });
  }
});

answersRouter.delete("/:topicsId/answers/:answerId", async (req, res) => {
  const id = new ObjectId(req.params.answerId);
  try {
    await collection.deleteOne({ _id: id });
    return res.json({
      message: `answer : (${id}) has been deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      message: `answer :(${id}) has been failed to delete : ${err}`,
    });
  }
});

answersRouter.patch("/:topicsId/answers/:answerId/vote", async (req, res) => {
  const { voteType } = req.body;

  if (!["upvote", "downvote"].includes(voteType)) {
    return res.status(400).json({
      message: "Invalid voteType. It should be 'upvote' or 'downvote'.",
    });
  }

  const topicsId = req.params.topicsId;
  const answerId = new ObjectId(req.params.answerId);

  try {
    const updateField = `votes.${voteType}s`;

    const updateQuery = { $inc: { [updateField]: 1 } };
    // console.log(updateQuery);
    const result = await collection.updateOne(
      { topic_id: topicsId, _id: answerId },
      updateQuery
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "Answer not found.",
      });
    }

    return res.json({
      message: `${voteType} successful for answer with ID ${answerId} : ${topicsId}`,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Failed to ${voteType} the answer. Error: ${err}`,
    });
  }
});

export default answersRouter;
