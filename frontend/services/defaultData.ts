export const defaultDeck = {
  name: "Envarre",
};

export const defaultCards = [
  {
    "question": "Enpunktsformeln för räta linjen",
    "answer": "En linje med lutning $k$ genom punkten $(a, b)$ ges av $y - b = k(x - a)$.",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Summationsformel",
    "answer": "$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Summationsformel",
    "answer": "$\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}$",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Volymformel för Klot",
    "answer": "Volymen $V$ av ett klot med radie $r$ är $V = \\frac{4}{3}\\pi r^3$.",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Volymformel för Kon",
    "answer": "Volymen $V$ av en kon med basradie $r$ och höjd $h$ är $V = \\frac{1}{3}\\pi r^2 h$.",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Additionsformel för Sinus",
    "answer": "$\\sin(s+t) = \\sin(s)\\cos(t) + \\cos(s)\\sin(t)$",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Additionsformel för Cosinus",
    "answer": "$\\cos(s+t) = \\cos(s)\\cos(t) - \\sin(s)\\sin(t)$",
    "tags": ["GRUNDLÄGGANDE"]
  },
  {
    "question": "Definition av Gränsvärde",
    "answer": "$\\lim_{x \\to a} f(x) = L$ betyder att $f(x)$ närmar sig $L$ då $x$ närmar sig $a$.",
    "tags": ["GRÄNSVÄRDEN"]
  },
  {
    "question": "Gränsvärdeslag för Summa",
    "answer": "$\\lim(f+g) = \\lim f + \\lim g$",
    "tags": ["GRÄNSVÄRDEN"]
  },
  {
    "question": "Gränsvärdeslag för Produkt",
    "answer": "$\\lim(fg) = (\\lim f)(\\lim g)$",
    "tags": ["GRÄNSVÄRDEN"]
  },
  {
    "question": "Kontinuitet",
    "answer": "$f(x)$ är kontinuerlig i $x = a$ om $\\lim_{x \\to a} f(x) = f(a)$.",
    "tags": ["GRÄNSVÄRDEN"]
  },
  {
    "question": "Satsen om mellanliggande värden (IVT)",
    "answer": "Om $f$ är kontinuerlig på $[a,b]$, så finns för varje $N$ mellan $f(a)$ och $f(b)$ ett $c \\in (a,b)$ sådant att $f(c) = N$.",
    "tags": ["GRÄNSVÄRDEN"]
  },
  {
    "question": "Satsen om största och minsta värde (EVT)",
    "answer": "Om $f$ är kontinuerlig på ett slutet och begränsat intervall $[a, b]$, så antar $f$ ett maximum och ett minimum på intervallet.",
    "tags": ["GRÄNSVÄRDEN"]
  },
  {
    "question": "Definitionsmängd",
    "answer": "Mängden av alla möjliga indata.",
    "tags": ["FUNKTIONER"]
  },
  {
    "question": "Värdemängd",
    "answer": "Mängden av alla möjliga utdata.",
    "tags": ["FUNKTIONER"]
  },
  {
    "question": "Udda Funktion",
    "answer": "$f(-x) = -f(x)$",
    "tags": ["FUNKTIONER"]
  },
  {
    "question": "Jämn Funktion",
    "answer": "$f(-x) = f(x)$",
    "tags": ["FUNKTIONER"]
  },
  {
    "question": "Begränsad Funktion",
    "answer": "Det existerar $M, m$ så att $m \\leq f(x) \\leq M$ för alla $x$ i definitionsmängden.",
    "tags": ["FUNKTIONER"]
  },
  {
    "question": "Derivatans Definition",
    "answer": "$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Derivata av Konstant",
    "answer": "$(c)' = 0$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Derivata av Potensfunktion",
    "answer": "$(x^n)' = n x^{n-1}$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Produktregeln",
    "answer": "$(fg)' = f'g + fg'$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Kvotregeln",
    "answer": "$\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Kedjeregeln",
    "answer": "$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Implicit Derivering",
    "answer": "Derivera båda sidor, lös ut $\\frac{dy}{dx}$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Invers Funktion",
    "answer": "Kräver injektivitet (ett-till-ett), surjektivitet (på), bijektivitet (båda). Om $y = f(x)$, är inversen $x = f^{-1}(y)$.",
    "tags": ["DERIVATA"]
  },
  {
    "question": "Kritisk Punkt",
    "answer": "$f'(x) = 0$ eller odefinierad.",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Växande Funktion",
    "answer": "$f'(x) > 0 \\Rightarrow$ växande",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Avtagande Funktion",
    "answer": "$f'(x) < 0 \\Rightarrow$ avtagande",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Konkav Upp (Konvex)",
    "answer": "$f''(x) > 0$",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Konkav Ner",
    "answer": "$f''(x) < 0$",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Inflexionspunkt",
    "answer": "Där $f''(x) = 0$ och konkaviteten ändras.",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "L’Hôpitals Regel",
    "answer": "$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$ för $0/0$ eller $\\infty/\\infty$.",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Medelvärdessatsen (MVT)",
    "answer": "Om $f$ är kontinuerlig på $[a, b]$ och deriverbar på $(a, b)$, finns $c \\in (a, b)$ så att $f'(c) = \\frac{f(b) - f(a)}{b - a}$.",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Rolles Sats",
    "answer": "Specialfall av MVT där $f(a) = f(b)$, så $f'(c) = 0$.",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Linjär Approximation",
    "answer": "$f(x) \\approx f(a) + f'(a)(x - a)$.",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Sned Asymptot (lutning)",
    "answer": "$a = \\lim_{x \\to \\pm \\infty} \\frac{f(x)}{x}$",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Sned Asymptot (y-skärning)",
    "answer": "$b = \\lim_{x \\to \\pm \\infty} (f(x) - a x)$",
    "tags": ["DERIVATA TILLÄMPNING"]
  },
  {
    "question": "Integralens Definition (Riemannsumma)",
    "answer": "$\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Analysens Huvudsats",
    "answer": "$F'(x) = f(x) \\Rightarrow \\int_a^b f(x)\\,dx = F(b) - F(a)$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Insättningsformeln",
    "answer": "$\\frac{d}{dx} \\int_a^{x} f(t)\\,dt = f(x)$",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Insättningsformeln (generaliserad)",
    "answer": "$\\frac{d}{dx} \\int_a^{g(x)} f(t)\\,dt = f(g(x)) \\cdot g'(x)$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Medelvärdessatsen för Integraler",
    "answer": "Om $f$ är kontinuerlig på $[a, b]$, finns $c \\in [a, b]$ så att $\\int_a^b f(x) \\, dx = f(c)(b - a)$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Linjäritet för Integraler",
    "answer": "$\\int_a^b (c_1 f(x) + c_2 g(x)) dx = c_1 \\int_a^b f(x) dx + c_2 \\int_a^b g(x) dx$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Uppdelning av Integrationsintervall",
    "answer": "$\\int_a^b f(x)dx + \\int_b^c f(x)dx = \\int_a^c f(x)dx$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Jämförelseprincipen för Integraler",
    "answer": "Om $f(x) \\le g(x)$ i $[a,b]$, så är $\\int_a^b f(x)dx \\le \\int_a^b g(x)dx$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Triangelolikheten för Integraler",
    "answer": "$|\\int_a^b f(x)dx| \\le \\int_a^b |f(x)|dx$.",
    "tags": ["INTEGRALER"]
  },
  {
    "question": "Variabelsubstitution",
    "answer": "Låt $u = g(x)$, då $du = g'(x)\\,dx$. $\\int f(g(x)) g'(x)\\,dx = \\int f(u)\\,du$.",
    "tags": ["INTEGRALTEKNIK"]
  },
  {
    "question": "Partiell Integration",
    "answer": "$\\int u\\,dv = uv - \\int v\\,du$.",
    "tags": ["INTEGRALTEKNIK"]
  },
  {
    "question": "Partialbråksuppdelning",
    "answer": "För rationella $\\frac{P(x)}{Q(x)}$, dela upp i enklare bråk.",
    "tags": ["INTEGRALTEKNIK"]
  },
  {
    "question": "Generaliserade Integraler",
    "answer": "Ta gränsvärden när gränser är oändliga eller funktionen är obegränsad.",
    "tags": ["INTEGRALTEKNIK"]
  },
  {
    "question": "Area under kurva",
    "answer": "$A = \\int_a^b f(x)\\,dx$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Area mellan kurvor",
    "answer": "$A = \\int_a^b [f(x) - g(x)]\\,dx$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Rotationsvolym kring x-axeln (Skivmetoden)",
    "answer": "$V = \\pi \\int_a^b [f(x)]^2\\,dx$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Rotationsvolym kring y-axeln (Cylindriska skal)",
    "answer": "$V = 2\\pi \\int_a^b x f(x)\\,dx$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Kurvlängd (Funktionsform)",
    "answer": "För $y=f(x)$, $L = \\int_a^b \\sqrt{1 + (f'(x))^2} \\, dx$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Kurvlängd (Parameterform)",
    "answer": "För en kurva $(x(t), y(t))$, $L = \\int_a^b \\sqrt{(x'(t))^2 + (y'(t))^2} \\, dt$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Rotationsarea",
    "answer": "Vid rotation kring x-axeln: $A = \\int_a^b 2\\pi f(x) \\sqrt{1 + (f'(x))^2} \\, dx$.",
    "tags": ["INTEGRAL TILLÄMPNING"]
  },
  {
    "question": "Konvergens av Talföljd",
    "answer": "$\\lim_{n \\to \\infty} a_n = L$.",
    "tags": ["SERIER"]
  },
  {
    "question": "Geometrisk Serie",
    "answer": "$\\sum_{n=0}^\\infty a r^n = \\frac{a}{1-r}$, för $|r| < 1$.",
    "tags": ["SERIER"]
  },
  {
    "question": "Divergenstestet",
    "answer": "Om $\\lim_{n \\to \\infty} a_n \\neq 0$, så divergerar $\\sum a_n$.",
    "tags": ["SERIER"]
  },
  {
    "question": "Kvottestet",
    "answer": "Låt $L = \\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|$. Om $L < 1 \\Rightarrow$ konvergent. Om $L > 1 \\Rightarrow$ divergent. Om $L = 1 \\Rightarrow$ ingen slutsats.",
    "tags": ["SERIER"]
  },
  {
    "question": "Rot-testet",
    "answer": "Låt $L = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}$. Om $L < 1 \\Rightarrow$ konvergent. Om $L > 1 \\Rightarrow$ divergent. Om $L = 1 \\Rightarrow$ ingen slutsats.",
    "tags": ["SERIER"]
  },
  {
    "question": "Jämförelsetestet",
    "answer": "Om $0 \\le a_n \\le b_n$ och $\\sum b_n$ konvergerar $\\Rightarrow \\sum a_n$ konvergerar. Om $a_n \\ge b_n \\ge 0$ och $\\sum b_n$ divergerar $\\Rightarrow \\sum a_n$ divergerar.",
    "tags": ["SERIER"]
  },
  {
    "question": "Jämförelsetest på gränsvärdesform",
    "answer": "Om $\\sum a_n$ och $\\sum b_n$ har positiva termer och $\\lim_{n \\to \\infty} \\frac{a_n}{b_n} = L > 0$ (och ändligt), så konvergerar eller divergerar båda serierna tillsammans.",
    "tags": ["SERIER"]
  },
  {
    "question": "Integralkriteriet",
    "answer": "För positiv, kontinuerlig, avtagande $f(n) = a_n$, konvergerar $\\sum a_n$ om och endast om $\\int_1^\\infty f(x) \\, dx$ konvergerar.",
    "tags": ["SERIER"]
  },
  {
    "question": "Leibniz kriterium för alternerande serier",
    "answer": "För $\\sum (-1)^n b_n$ (med $b_n>0$), om $b_{n+1} \\le b_n$ och $\\lim_{n \\to \\infty} b_n = 0$, så konvergerar serien.",
    "tags": ["SERIER"]
  },
  {
    "question": "Allmän Formel (Taylor-serie)",
    "answer": "$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n$.",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Maclaurin-serie (a = 0)",
    "answer": "$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!} x^n$.",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Standardutveckling för $e^x$",
    "answer": "$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\dots$",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Standardutveckling för $\\sin(x)$",
    "answer": "$\\sin(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \\frac{x^3}{3!} + \\dots$",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Standardutveckling för $\\cos(x)$",
    "answer": "$\\cos(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!} = 1 - \\frac{x^2}{2!} + \\dots$",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Standardutveckling för $\\frac{1}{1-x}$",
    "answer": "$\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + \\dots$ (för $|x| < 1$)",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Taylors restterm (Lagranges form)",
    "answer": "Felet $E_n(x) = f(x) - P_n(x) = \\frac{f^{(n+1)}(c)}{(n+1)!} (x - a)^{n+1}$, där $c$ ligger mellan $x$ och $a$.",
    "tags": ["TAYLOR"]
  },
  {
    "question": "Ekvation (1:a ordn. linjär homogen)",
    "answer": "$y' + a y = 0$.",
    "tags": ["ODE"]
  },
  {
    "question": "Karakteristisk ekvation (1:a ordn.)",
    "answer": "$r + a = 0 \\Rightarrow r = -a$.",
    "tags": ["ODE"]
  },
  {
    "question": "Lösning (1:a ordn. linjär homogen)",
    "answer": "$y = C e^{-a x}$.",
    "tags": ["ODE"]
  },
  {
    "question": "Ekvation (2:a ordn. linjär homogen)",
    "answer": "$y'' + a y' + b y = 0$.",
    "tags": ["ODE"]
  },
  {
    "question": "Karakteristisk ekvation (2:a ordn.)",
    "answer": "$r^2 + a r + b = 0$.",
    "tags": ["ODE"]
  },
  {
    "question": "Lösning (2 reella rötter)",
    "answer": "$y = C_1 e^{r_1 x} + C_2 e^{r_2 x}$.",
    "tags": ["ODE"]
  },
  {
    "question": "Lösning (1 dubbelrot)",
    "answer": "$y = (C_1 + C_2 x) e^{r x}$.",
    "tags": ["ODE"]
  },
  {
    "question": "Lösning (komplexa rötter $\\alpha \\pm i \\beta$)",
    "answer": "$y = e^{\\alpha x} (C_1 \\cos \\beta x + C_2 \\sin \\beta x)$.",
    "tags": ["ODE"]
  },
  {
    "question": "Ekvation (Icke-homogen)",
    "answer": "$y'' + a y' + b y = f(x)$.",
    "tags": ["ODE"]
  },
  {
    "question": "Allmän lösning (Icke-homogen)",
    "answer": "$y = y_h + y_p$, där $y_h$ är den homogena lösningen och $y_p$ är en partikulärlösning.",
    "tags": ["ODE"]
  },
  {
    "question": "Metod för $y_p$ (Obestämda koefficienter)",
    "answer": "Används när högerledet $f(x)$ är en polynom, exponentialfunktion, sinus, cosinus eller produkter av dessa. En partikulärlösning $y_p$ av liknande form ansätts.",
    "tags": ["ODE"]
  },
  {
    "question": "Ansats för polynom",
    "answer": "Om $f(x) = A_n x^n + \\dots + A_0$, ansätt $y_p = B_n x^n + \\dots + B_0$.",
    "tags": ["ODE"]
  },
  {
    "question": "Ansats för exponentialfunktion",
    "answer": "Om $f(x) = C e^{\\alpha x}$, ansätt $y_p = A e^{\\alpha x}$.",
    "tags": ["ODE"]
  },
  {
    "question": "Ansats för sinus/cosinus",
    "answer": "Om $f(x)$ är $C \\cos(\\beta x)$ eller $D \\sin(\\beta x)$, ansätt $y_p = A \\cos(\\beta x) + B \\sin(\\beta x)$.",
    "tags": ["ODE"]
  },
  {
    "question": "Ansats för produkter",
    "answer": "Om $f(x)$ är en produkt av ovanstående (t.ex. $x e^{2x}$), ansätt en produkt av motsvarande ansatser (t.ex. $(Ax+B)e^{2x}$).",
    "tags": ["ODE"]
  },
  {
    "question": "Modifiering vid Resonans",
    "answer": "Om någon term i ansatsen för $y_p$ redan är en lösning till den homogena ekvationen ($y_h$), måste hela ansatsen multipliceras med $x$. Om den nya ansatsen fortfarande har termer i $y_h$ (vid dubbelrötter), multiplicera med $x$ igen.",
    "tags": ["ODE"]
  },
  {
    "question": "Metod för $y_p$ (Variation av parametrar)",
    "answer": "Generell metod som fungerar när obestämda koefficienters metod inte är tillämplig (t.ex. för $f(x) = \\tan(x)$ eller $f(x) = \\frac{1}{x}$).",
    "tags": ["ODE"]
  }
];
