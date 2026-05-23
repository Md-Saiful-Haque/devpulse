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
    `, [issueId] );

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

export const issueService = {
    createIssueService,
    getAllIssueService,
    getSingleIssueService
}