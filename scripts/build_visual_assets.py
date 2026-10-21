"""Original, code-native SVG artwork for fictional entities. No real-person likenesses.
These original illustrations are dedicated to CC0; third-party team logos are excluded.
"""
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / 'public/images'


def write(folder, name, content):
    target = IMAGES / folder / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8')


def scene(kind, variant):
    accent, second = [('#c3f85c', '#59c8bb'), ('#60d5ef', '#b69df7')][variant]
    if kind == 'open':
        accent, second = [('#60d5ef', '#7ee2b8'), ('#88aaff', '#b69df7')][variant]
    elif kind == 'invitational':
        accent, second = [('#eac47b', '#9be3c6'), ('#ed9d83', '#d0b4f5')][variant]
    defs = f'''<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#17242b"/><stop offset="1" stop-color="#080d12"/></linearGradient><radialGradient id="light"><stop stop-color="{accent}" stop-opacity=".22"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient><linearGradient id="panel" x2="1" y2="1"><stop stop-color="#31444e"/><stop offset="1" stop-color="#101b22"/></linearGradient><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#a0ccd0" stroke-opacity=".07"/></pattern></defs>'''
    base = f'<rect width="1200" height="675" fill="url(#bg)"/><rect width="1200" height="675" fill="url(#grid)"/><ellipse cx="810" cy="270" rx="650" ry="480" fill="url(#light)"/>'
    if kind in ['tournament', 'masters', 'open', 'invitational']:
        art = f'''<path d="M0 550 600 360 1200 550v125H0" fill="#101a21"/><path d="m145 200 250-82 410 0 250 82v280l-250-80H395l-250 80z" fill="#121e25" stroke="#33474e" stroke-width="3"/><path d="M395 118v282m410-282v282M145 200l250 42h410l250-42" fill="none" stroke="#547079" stroke-width="2"/><path d="M220 125 450 490 170 490zM980 125 750 490h280z" fill="{accent}" opacity=".07"/><rect x="410" y="164" width="380" height="210" rx="6" fill="#07151a" stroke="{accent}" stroke-width="3"/><path d="m600 200 58 30-11 71-47 32-47-32-11-71z" fill="none" stroke="{accent}" stroke-width="6"/><path d="m580 245 20 20 24-30" fill="none" stroke="{accent}" stroke-width="5"/><path d="m280 430 160-35h320l160 35-85 45H365z" fill="#23343b" stroke="#5f7a80" stroke-width="2"/><path d="M325 485h550l100 80H225z" fill="#152831" stroke="{accent}" stroke-opacity=".4"/>'''
        for index in range(10):
            x = 345 + index * 51
            art += f'<rect x="{x}" y="417" width="32" height="20" rx="2" fill="#071115" stroke="{second}"/><path d="M{x+16} 437v8m-8 0h16" stroke="#6a8088"/>'
        for index in range(15):
            x = 65 + index * 77
            art += f'<circle cx="{x}" cy="{590 + index % 3 * 13}" r="15" fill="#071015"/><path d="M{x-24} 675v-35q24-30 48 0v35" fill="#071015"/>'
    elif kind == 'analysis':
        art = f'''<g transform="translate(235 70) rotate(-8 365 270)"><rect width="730" height="510" rx="20" fill="#14252d" stroke="#4b626c" stroke-width="3"/><path d="M45 80h175v95h140V80h160v110h165v150H525v120H350V340H190v120H45z" fill="#253f48" stroke="#6a919b" stroke-width="4"/><path d="M220 80v95m140 0V80M190 340v120m160-120v120M525 190h160" stroke="#c3d1cf" stroke-width="9"/><path d="M90 400V260h200v-45h200v95h140" fill="none" stroke="{accent}" stroke-width="7" stroke-linejoin="round" stroke-dasharray="14 10"/><circle cx="90" cy="400" r="20" fill="{accent}"/><circle cx="630" cy="310" r="28" fill="#132a2c" stroke="{second}" stroke-width="4"/><path d="m615 310 15-15 15 15-15 15z" fill="{second}"/><circle cx="440" cy="120" r="13" fill="{accent}"/><circle cx="580" cy="245" r="13" fill="{second}"/></g>'''
    elif kind == 'match-preview':
        art = f'''<path d="m55 90 465 80v370L55 460z" fill="url(#panel)" stroke="#4c6672" stroke-width="3"/><path d="m1145 90-465 80v370l465-80z" fill="url(#panel)" stroke="#4c6672" stroke-width="3"/><path d="m130 180 280 48v180l-280-48z" fill="#14262d" stroke="{accent}" stroke-width="2"/><path d="m1070 180-280 48v180l280-48z" fill="#14262d" stroke="{second}" stroke-width="2"/><circle cx="270" cy="300" r="58" fill="none" stroke="{accent}" stroke-width="5"/><path d="M250 300h40m-20-20v40" stroke="{accent}" stroke-width="4"/><path d="m930 245 60 45-60 75-60-75z" fill="none" stroke="{second}" stroke-width="5"/><path d="m610 170-65 145h65l-30 150 85-190h-65z" fill="{accent}"/><path d="m220 540 380 52 380-52" fill="none" stroke="#557580" stroke-width="3"/>'''
    elif kind == 'transfers':
        art = ''
        for index in range(5):
            x = 125 + index * 205
            y = 150 + (index % 2) * 50
            art += f'<rect x="{x}" y="{y}" width="145" height="260" rx="14" fill="url(#panel)" stroke="{accent if index == 2 else "#47616c"}" stroke-width="3"/><circle cx="{x+72}" cy="{y+75}" r="30" fill="#49616b"/><path d="M{x+27} {y+175}v-25q45-55 90 0v25" fill="#49616b"/><path d="M{x+30} {y+210}h85m-85 17h50" stroke="{accent if index == 2 else "#809ca7"}" stroke-width="5"/><circle cx="{x+72}" cy="505" r="8" fill="{accent}"/>'
        art += f'<path d="M190 505h820M530 87h180m-25-15 25 15-25 15M670 570H490m25-15-25 15 25 15" fill="none" stroke="{accent}" stroke-width="4"/>'
    else:  # Team news: original communication/headset workstation illustration.
        art = f'''<g transform="translate(180 65) rotate(-5 400 250)"><rect x="90" y="85" width="620" height="340" rx="18" fill="url(#panel)" stroke="#526e79" stroke-width="4"/><rect x="110" y="106" width="580" height="295" rx="8" fill="#0b181f"/><path d="M370 425v60h-95m95 0h160" stroke="#69818b" stroke-width="12"/><path d="M260 275v-45a140 140 0 0 1 280 0v45" fill="none" stroke="{accent}" stroke-width="20"/><rect x="238" y="236" width="48" height="105" rx="17" fill="#254350" stroke="{accent}" stroke-width="4"/><rect x="514" y="236" width="48" height="105" rx="17" fill="#254350" stroke="{accent}" stroke-width="4"/><path d="M540 335v25q0 20-45 20h-45" fill="none" stroke="{accent}" stroke-width="6"/><rect x="420" y="371" width="45" height="16" rx="8" fill="{accent}"/><path d="M590 164v25m20-37v50m20-32v18" stroke="{second}" stroke-width="5"/></g><path d="m190 600 710-30 100 45-690 40z" fill="#243c46" stroke="#5e7b85" stroke-width="2"/>'''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><title>Original fictional esports {escape(kind)} illustration</title>{defs}{base}{art}<path d="M46 46h70M46 46v40m1108 543h-70m70 0v-40" stroke="{accent}" stroke-width="2" opacity=".6"/></svg>'


def avatar(index):
    accent = ['#c3f85c', '#68d8ea', '#c5acf4', '#f2bb73', '#7de2b1', '#f299a8', '#a2c1ff', '#e2dd88'][index]
    visor = ['M92 112h136v42H92z', 'M88 112h144l-20 48H108z', 'M92 112h136l-12 48H104z'][index % 3]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><title>Fictional nonhuman gaming avatar {index+1}</title><defs><radialGradient id="light"><stop stop-color="{accent}" stop-opacity=".18"/><stop offset="1" stop-color="#10191e"/></radialGradient><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#4a5e67"/><stop offset="1" stop-color="#1b2d36"/></linearGradient></defs><rect width="320" height="320" fill="#10191e"/><circle cx="160" cy="155" r="170" fill="url(#light)"/><circle cx="160" cy="145" r="112" fill="none" stroke="{accent}" stroke-opacity=".18"/><path d="M38 320v-36l65-56h114l65 56v36" fill="url(#metal)" stroke="#71808a" stroke-width="2"/><path d="m122 222 38 45 38-45" fill="#101e26" stroke="{accent}" stroke-width="2"/><path d="m87 83 35-24h76l35 24v90l-35 50h-76l-35-50z" fill="url(#metal)" stroke="#81969e" stroke-width="2"/><path d="{visor}" fill="#0a171e" stroke="{accent}" stroke-width="3"/><path d="M112 132h25m46 0h25" stroke="{accent}" stroke-width="5"/><path d="M138 189h44m-34 8h24" stroke="#9db6bf" stroke-width="3"/><path d="M72 111v-6a88 88 0 0 1 176 0v6" fill="none" stroke="#91a5ad" stroke-width="7"/><rect x="64" y="111" width="22" height="62" rx="7" fill="#14232d" stroke="{accent}" stroke-width="2"/><rect x="234" y="111" width="22" height="62" rx="7" fill="#14232d" stroke="{accent}" stroke-width="2"/><path d="M247 170v25l-37 12h-23" fill="none" stroke="{accent}" stroke-width="3"/><path d="M75 287h50m70 0h50" stroke="{accent}" stroke-width="3"/></svg>'''


if __name__ == '__main__':
    for kind in ['team-news', 'transfers', 'match-preview', 'tournament', 'analysis']:
        for variant in range(2):
            write('editorial', f'{kind}-{variant}.svg', scene(kind, variant))
    for kind in ['masters', 'open', 'invitational']:
        for variant in range(2):
            write('tournaments', f'{kind}-{variant}.svg', scene(kind, variant))
    for index in range(8):
        write('avatars', f'gaming-{index}.svg', avatar(index))
    data = json.loads((ROOT / 'backend/app/seed_data.json').read_text(encoding='utf-8'))
    for team in data['teams']:
        initials = ''.join(word[0] for word in team['name'].split())[:3].upper()
        if len(initials) == 1:
            initials = team['name'][:3].upper()
        write('teams', f"neutral-{team['id']}.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><title>Neutral text fallback for {escape(team["name"])}, not an official logo</title><rect width="240" height="240" rx="20" fill="#e6eae6"/><text x="120" y="136" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="64" fill="#364048">{escape(initials)}</text><text x="120" y="180" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" letter-spacing="3" fill="#677478">TEAM</text></svg>')
    # Phase 6B owns the neutral question-mark fallback; do not regenerate robots.
    if not (IMAGES / 'player-placeholder.svg').exists():
        raise RuntimeError('Restore the committed question-mark player placeholder.')

    credits = json.loads((IMAGES / 'team-credits.json').read_text(encoding='utf-8'))
    items = ''.join(f'<li><img src="{escape(item["path"])}" alt="{escape(item["name"])} logo"/><div><h2>{escape(item["name"].upper())}</h2><p>Author: {escape(item["author"])}</p><p><a href="{escape(item["source"])}">Source and rights statement</a> · <a href="{escape(item["licenseUrl"])}">{escape(item["license"])}</a></p><p>{escape(item["changes"])}</p></div></li>' for item in credits)
    (ROOT / 'public/legacy-asset-credits.html').write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Visual credits · CS2 ARENA</title><style>body{{font:15px/1.7 Arial,sans-serif;background:#0c0e0c;color:#f0f2ed;margin:0;padding:32px}}main{{max-width:960px;margin:auto}}a{{color:#c3f85c}}h1{{font-size:36px}}h2{{font-size:19px;margin:0}}p{{color:#a5ae9e}}ul{{list-style:none;padding:0}}li{{display:flex;gap:24px;border-top:1px solid #30362d;padding:24px 0}}img{{width:90px;height:90px;object-fit:contain;background:#f0f2ed;border-radius:10px;padding:10px;box-sizing:border-box}}li div{{min-width:0}}p,a{{overflow-wrap:anywhere}}@media(max-width:520px){{body{{padding:20px}}li{{flex-direction:column}}}}</style></head><body><main><a href="/">← CS2 ARENA</a><h1>Visual asset credits</h1><p>This independent university demo is not affiliated with or endorsed by the organizations below. Logos identify teams; team names and trademarks remain with their owners. Demo stories, rosters, statistics, and events are fictional.</p><h2>Original artwork</h2><p>CS2 ARENA editorial illustrations, tournament artwork, neutral text fallbacks, and eight nonhuman gaming avatars were created specifically for this project as editable SVGs. They depict no real people, official game maps, or real event scenes. These original SVG assets are dedicated under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>. This dedication does not apply to third-party team logos.</p><h2>Team logos</h2><p>Files are bundled locally, without color changes, cropping, filters, or effects. Source pages were checked on 19 October 2026. Teams without a verified asset (including Vitality) use an explicitly neutral text fallback, not an invented brand logo.</p><ul>{items}</ul></main></body></html>''', encoding='utf-8')
    print('Created 10 editorial illustrations, 6 tournament artworks, and 8 neutral avatars.')
