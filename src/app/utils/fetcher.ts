export const fetcher = (url: string, token: string) => {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((res) => {
    return res.json();
  });
};
