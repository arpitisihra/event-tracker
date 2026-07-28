export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL parameter required" });

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const html = await response.text();
    
    // Extract Next.js data block from page source
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!match) return res.status(404).json({ error: "Could not parse event data from page." });

    const json = JSON.parse(match[1]);
    const sideEvents = json.props?.pageProps?.sideEvents || [];
    const mainEvents = json.props?.pageProps?.mainEvents || [];

    const parsedEvents = [...sideEvents, ...mainEvents].map(item => {
      const e = item.event || item;
      return {
        id: e.id || item.id,
        name: e.name || e.event || "Untitled Event",
        start_date: e.startDate || "TBD",
        location: e.location || e.city?.[0] || "Online / TBD",
        website: e.website || e.link || "",
        organizer: e.organizer || "Unknown"
      };
    });

    return res.status(200).json({ events: parsedEvents });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
