import { pool } from "../../db"
import type { TIssue } from "./issue.interface"


const createIssueService = async (payload: TIssue, reporterId: number) => {
    const { title, description, type, } = payload;

    const result = await pool.query(`
        INSERT INTO issues(title, description, type, reporter_id)
        VALUES($1, $2, $3, $4) RETURNING *
        `, [title, description, type, reporterId]);

    return result.rows[0]
}

const getAllIssueService = async (
    sort: string,
    type?: string,
    status?: string
) => {
    let query = `SELECT * FROM issues`;
    const conditions: string[] = [];
    const values: string[] = [];

    if (type) {
        values.push(type);
        conditions.push(`type = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query +=
        sort === "oldest"
            ? " ORDER BY created_at ASC"
            : " ORDER BY created_at DESC";

    const issueResult = await pool.query(
        query,
        values
    );

    const issues = issueResult.rows;

    const formattedIssues = [];

    for (const issue of issues) {
        const reporterResult = await pool.query(
            `
      SELECT id,name,role
      FROM users
      WHERE id=$1
      `,
            [issue.reporter_id]
        );

        formattedIssues.push({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter: reporterResult.rows[0],
            created_at: issue.created_at,
            updated_at: issue.updated_at,
        });
    }

    return formattedIssues;
};

const getSingleIssueService = async (issueId: number) => {
    const issueResult = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [issueId]);

    const issue = issueResult.rows[0];

    if (!issue) {
        throw new Error("Issue not found");
    }

    const reporterResult = await pool.query(`
    SELECT id,name,role FROM users WHERE id=$1
    `, [issue.reporter_id]);

    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporterResult.rows[0],
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
};

const updateIssueService = async (issueId: number,
    payload: {
        title?: string;
        description?: string;
        type?: string;
    },
    user: {
        id: number;
        role: string;
    }
) => {
    const issueResult = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [issueId]);

    const issue = issueResult.rows[0];

    if (!issue) {
        throw new Error("Issue not found");
    }

    if (user.role === "contributor" && issue.reporter_id !== user.id) {
        throw new Error("You can update only your own issue");
    }

    if (user.role === "contributor" && issue.status !== "open") {
        throw new Error("Open issues only can be edited");
    }

    const title = payload.title || issue.title;

    const description = payload.description || issue.description;

    const type = payload.type || issue.type;

    const result = await pool.query(`
    UPDATE issues SET title=$1, description=$2, type=$3, updated_at=CURRENT_TIMESTAMP
    WHERE id=$4 RETURNING *
    `, [title, description, type, issueId]);

    return result.rows[0];
};

const deleteIssueService = async (issueId: number) => {
  const result = await pool.query(`
    DELETE FROM issues WHERE id=$1 RETURNING *
    `, [issueId]);

  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }

  return result;
};

export const issueService = {
    createIssueService,
    getAllIssueService,
    getSingleIssueService,
    updateIssueService,
    deleteIssueService
}