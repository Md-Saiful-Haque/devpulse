import config from "../../config";
import { pool } from "../../db";
import type { LoginUser, SignUpUser } from "./auth.interface"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const signUpUser = async (payload: SignUpUser) => {
    const { name, email, password, role } = payload;

    const existingUser = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email])

    if (existingUser.rows.length > 0) {
        throw new Error("Email already exists")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, hashPassword, role])

    return result.rows[0];
}


const loginUser = async (payload: LoginUser) => {
    const { email, password } = payload;

    const result = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [email]);

    const user = result.rows[0];

    if (!user) {
        throw new Error("Invalid credentials")
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        throw new Error("Invalid credentials")
    }

    // Generate token
    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role
    }

    const token = jwt.sign(jwtPayload, config.jwt_secret, { expiresIn: "5d" })

    return {
        token, user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    }
}

export const authService = {
    signUpUser,
    loginUser
}