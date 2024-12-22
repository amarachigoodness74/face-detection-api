import { Router, Request, Response } from "express";
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
import config from "config";
import User from "../models/user.model";
import { imageValidation, validate } from "../validations/user.validations";

const router = Router();

router.get("/profile/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Invalid route." });
    }

    // Check if user exists
    const user = await User.findById({ id });
    if (!user) {
      res.status(404).json({ error: "User not found." });
    } else {
      res.status(200).json({ user: user });
    }
  } catch (error: any) {
    res.status(500).json({ error: "error getting user" });
  }
});

// Clarifai API setup
const clarifaiAPI = config.get("environment.clarifai") as string;
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${clarifaiAPI}`);

// Define the bounding box type
interface BoundingBox {
  top_row: number;
  left_col: number;
  bottom_row: number;
  right_col: number;
}

const getClarifaiData = async (imageUrl: string) => {
  try {
    stub.PostModelOutputs(
      {
        model_id: "face-detection",
        inputs: [
          {
            data: {
              image: { url: imageUrl },
            },
          },
        ],
      },
      metadata,
      (err: any, response: any) => {
        if (err) {
          console.error("Error:", err);
          return { error: "Unable to process the request" };
        }

        if (response.status.code !== 10000) {
          console.error("Failed status:", response.status.description);
          return { error: response.status.description };
        }

        // Extract bounding box information for faces
        const faces: BoundingBox[] = response.outputs[0].data.regions.map(
          (region: any) => {
            return region.region_info.bounding_box;
          }
        );

        return faces;
      }
    );
  } catch (error) {
    console.error("Server Error:", error);
    return { error: "An unexpected error occurred" };
  }
};

router.post(
  "/image",
  imageValidation(),
  validate,
  async (req: Request, res: Response) => {
    const { email, image } = req.body;
        console.log("======== image", image);
    try {
      if (!email || !image) {
        res.status(400).json({ message: "Invalid route." });
      }

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found." });
      } else {
        await User.findOneAndUpdate(
          { email: (user.email) },
          { image, entries: user.entries + 1 }
        );
        const imageData = await getClarifaiData(image);
        console.log("======== imageData", imageData);
        res.status(200).json(imageData);
      }
    } catch (error: any) {
        console.log("======== error", error);
      res.status(500).json({ error: "unable to get entries" });
    }
  }
);

export default router;
