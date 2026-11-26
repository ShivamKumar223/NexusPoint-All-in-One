import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { queryOne } from "../utils/query.js";

// Handle organization registration
export const registerOrganization = async (req, res) => {
  try {
    const { organizationName, ownerName, email, password } = req.body;

    const existingUser = await queryOne(
      `SELECT "id" FROM "organizations" WHERE "email" = $1`,
      [email]
    );
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await queryOne(
      `INSERT INTO "organizations" ("organizationName","ownerName","email","password")
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [organizationName, ownerName, email, hashedPassword]
    );

    res.status(201).json({
      message: "Organization created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// generate jwt token
const generateToken = ({
  id: organizationId,
  organizationName,
  ownerName,
  email,
  role,
}) => {
  const token = jwt.sign(
    { organizationId, organizationName, ownerName, email, role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};

// Handle organization Login
export const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isExistUser = await queryOne(
      `SELECT * FROM "organizations" WHERE "email" = $1`,
      [email]
    );
    if (isExistUser) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        isExistUser.password
      );

      if (isPasswordCorrect) {
        const token = generateToken(isExistUser);

        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });
        const { password: temp, ...user } = isExistUser;
        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: user,
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
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
      `SELECT "id" FROM "organizations" WHERE "id" = $1`,
      [req.user.organizationId]
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await queryOne(
      `UPDATE "organizations" SET "password" = $1 WHERE "id" = $2 RETURNING "id"`,
      [hashedPassword, req.user.organizationId]
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
