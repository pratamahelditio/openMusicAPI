const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptionError/InvariantError');
const NotFoundError = require('../exceptionError/NotFoundError');
const mapDBtoModel = require('../utils/mapDBToModel');

class OpenMusicServices {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    if (duration < 0) {
      throw new InvariantError('Music gagal ditambahkan, durasi tidak boleh minus');
    }

    const query = {
      text: 'INSERT INTO openmusic VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Music gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM openmusic');
    return result.rows.map(mapDBtoModel)[0];
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM openmusic WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Music tidak dapat ditemukan');
    }

    return result.rows.map(mapDBtoModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration,
  }) {
    if (duration < 0) {
      throw new InvariantError('Music gagal ditambahkan, durasi tidak boleh minus');
    }

    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE openmusic SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal diperbaharui, Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM openmusic WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus.  Id tidak ditemukan');
    }
  }
}

module.exports = OpenMusicServices;