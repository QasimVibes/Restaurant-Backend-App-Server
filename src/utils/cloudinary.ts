import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "qasimrazzaq",
  api_key: "212268141693661",
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// export const cloudinary_upload = async (file: string) => {
//   try {
//     if (!file) return null;
//     const response = await cloudinary.uploader.upload(file, {
//       resource_type: "auto",
//     });
//     return response;
//   } catch (error) {
//     console.log("Error have been occuried wile uploading on cloudinary", error);
//     return null;
//   }
// };

// export const cloudinary_delete = async (public_id: string) => {
//   try {
//     if (!public_id) return null;
//     const response = await cloudinary.uploader.destroy(public_id);
//     return response;
//   } catch (error) {
//     console.log("Error have been occuried wile deleting on cloudinary", error);
//     return null;
//   }
// };
