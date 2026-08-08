<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Domestic Real Estate API — Status</title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #07162C;
            color: #E5E9F0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .card {
            width: 100%;
            max-width: 640px;
            background: #0A2647;
            border: 1px solid rgba(201,162,39,0.25);
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .brand .dot { width: 10px; height: 10px; border-radius: 50%; background: {{ $overallOk ? '#22C55E' : '#EF4444' }}; box-shadow: 0 0 12px {{ $overallOk ? '#22C55E' : '#EF4444' }}; }
        .brand h1 { font-size: 15px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #C9A227; margin: 0; }
        .headline { font-size: 26px; font-weight: 800; margin: 0 0 8px; }
        .sub { color: #9BB0CC; font-size: 14px; margin: 0 0 28px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .item {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 14px 16px;
        }
        .item .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #7C93B8; font-weight: 700; margin-bottom: 6px; }
        .item .value { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 999px; }
        .badge.ok { background: rgba(34,197,94,0.15); color: #4ADE80; }
        .badge.bad { background: rgba(239,68,68,0.15); color: #F87171; }
        .footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #7C93B8; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        a { color: #C9A227; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="card">
        <div class="brand">
            <span class="dot"></span>
            <h1>Domestic Real Estate</h1>
        </div>

        <p class="headline">{{ $overallOk ? 'API is up and running' : 'API is experiencing issues' }}</p>
        <p class="sub">This is the backend API server. It isn't a public website — see <a href="https://www.domesticrealestate.us">domesticrealestate.us</a> for the app.</p>

        <div class="grid">
            <div class="item">
                <div class="label">Database</div>
                <div class="value">
                    <span class="badge {{ $dbOk ? 'ok' : 'bad' }}">{{ $dbOk ? 'Connected' : 'Unreachable' }}</span>
                </div>
            </div>
            <div class="item">
                <div class="label">Response Time</div>
                <div class="value">{{ $responseMs }} ms</div>
            </div>
            @if($showDetails)
            <div class="item">
                <div class="label">Server Load (1 min)</div>
                <div class="value">{{ $load1 !== null ? $load1 : 'N/A on this OS' }}</div>
            </div>
            <div class="item">
                <div class="label">Memory Usage</div>
                <div class="value">{{ $memUsed }}</div>
            </div>
            <div class="item">
                <div class="label">PHP / Laravel</div>
                <div class="value">{{ $phpVersion }} / {{ $laravelVersion }}</div>
            </div>
            <div class="item">
                <div class="label">Environment</div>
                <div class="value">{{ ucfirst($env) }}</div>
            </div>
            @endif
        </div>

        <div class="footer">
            <span>Checked at {{ $checkedAt }}</span>
            <span>API base: <a href="/api">/api</a></span>
        </div>
    </div>
</body>
</html>
