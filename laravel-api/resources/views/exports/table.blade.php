<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { margin: 24px; color: #111827; }
        h1 { font-size: 18px; color: #0A2647; margin: 0 0 4px; }
        .meta { font-size: 10px; color: #6B7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; }
        th { background: #0A2647; color: #fff; text-align: left; padding: 6px; }
        td { padding: 5px 6px; border-bottom: 1px solid #E5E7EB; }
        tr:nth-child(even) td { background: #F9FAFB; }
        .empty { padding: 24px; text-align: center; color: #6B7280; font-size: 11px; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <div class="meta">Domestic Real Estate &middot; Generated {{ $generatedAt }} &middot; {{ count($rows) }} record(s)</div>

    @if (count($rows) === 0)
        <div class="empty">No records matched the selected filters.</div>
    @else
        <table>
            <thead>
                <tr>
                    @foreach ($headers as $header)
                        <th>{{ ucwords(str_replace('_', ' ', $header)) }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>
                        @foreach ($row as $cell)
                            <td>{{ $cell }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
