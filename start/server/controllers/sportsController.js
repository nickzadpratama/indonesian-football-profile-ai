const axios = require("axios");

const API_SPORTS_URL = "https://v3.football.api-sports.io";

function positiveInteger(value, name) {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  ) {
    throw {
      name: "InvalidSportsInput",
      message: `${name} must be a positive integer`,
    };
  }
  return Number(value);
}

function teamQuery(query) {
  if (query.id !== undefined) return { id: positiveInteger(query.id, "id") };
  if (
    typeof query.country !== "string" ||
    !query.country.trim() ||
    query.country.trim().length > 80
  ) {
    throw {
      name: "InvalidSportsInput",
      message: "country must be text up to 80 characters",
    };
  }
  return { country: query.country.trim() };
}

async function getProviderData(path, params) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) {
    throw {
      name: "ServiceUnavailable",
      message: "Football data service is not configured",
    };
  }

  let response;
  try {
    response = await axios.get(`${API_SPORTS_URL}${path}`, {
      params,
      headers: { "x-apisports-key": apiKey },
      timeout: 10000,
    });
  } catch (error) {
    console.error("API-Sports request failed", {
      status: error.response?.status ?? "unknown",
    });
    throw {
      name: "ServiceUnavailable",
      message: "Football data service is temporarily unavailable",
    };
  }

  if (
    !Array.isArray(response.data?.response) ||
    (response.data.errors &&
      (Array.isArray(response.data.errors)
        ? response.data.errors.length > 0
        : Object.keys(response.data.errors).length > 0))
  ) {
    throw {
      name: "ServiceUnavailable",
      message: "Football data service returned an invalid response",
    };
  }

  return response.data;
}

class SportsController {
  static async teams(req, res, next) {
    try {
      const params = teamQuery(req.query);
      res.json(await getProviderData("/teams", params));
    } catch (error) {
      next(error);
    }
  }

  static async squad(req, res, next) {
    try {
      const team = positiveInteger(req.query.team, "team");
      res.json(await getProviderData("/players/squads", { team }));
    } catch (error) {
      next(error);
    }
  }

  static async playerStatistics(req, res, next) {
    try {
      const id = positiveInteger(req.query.id, "id");
      const season = positiveInteger(req.query.season, "season");
      res.json(await getProviderData("/players", { id, season }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SportsController;
