/** @returns {"private" | "public"} */
export function getAvatarAccess() {
  const access = process.env.BLOB_ACCESS ?? "private";
  if (access !== "private" && access !== "public") {
    throw new Error("BLOB_ACCESS must be private or public");
  }
  return access;
}

/**
 * Private blobs are served through an authenticated route, never a bare Blob URL.
 * @param {{url: string, pathname: string}} blob
 * @param {"private" | "public"} access
 */
export function getAvatarUrl(blob, access) {
  return access === "private" ? `/api/${blob.pathname}` : blob.url;
}

/** @param {string} url @param {string} userId */
export function getPrivateAvatarPath(url, userId) {
  const match = url.match(
    /^\/api\/avatars\/(\d+)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:jpg|jpeg|png|webp|gif))$/,
  );
  return match && match[1] === userId
    ? `avatars/${match[1]}/${match[2]}`
    : null;
}
