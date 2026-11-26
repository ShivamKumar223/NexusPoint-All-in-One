import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { queryOne } from "../utils/query.js";

const generateToken = ({
  name,
  organizationId,
  id: userId,
  memberId,
  role,
  designation,
  skills,
}) => {
  const token = jwt.sign(
    { name, organizationId, userId, memberId, role, designation, skills },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};

// login member
export const loginMember = async (req, res) => {
  try {
    const { organizationId, memberId, password } = req.body;

    const isUserExist = await queryOne(
      `SELECT * FROM "members" WHERE "organizationId" = $1 AND "memberId" = $2`,
      [organizationId, memberId]
    );
    if (!isUserExist) {
      return res.status(404).json({ message: "User not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      isUserExist.password
    );
    if (isPasswordCorrect) {
      const token = generateToken(isUserExist);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const { password: temp, ...user } = isUserExist;
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
      });
    } else {
      return res.status(401).json({ message: "Invalid Id or password" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Change Password
export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const user = await queryOne(
      `SELECT "id" FROM "members" WHERE "id" = $1`,
      [req.user.userId]
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await queryOne(
      `UPDATE "members" SET "password" = $1 WHERE "id" = $2 RETURNING "id"`,
      [hashedPassword, req.user.userId]
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
