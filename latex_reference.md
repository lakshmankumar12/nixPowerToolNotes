# basic getting a pdf

```tex
\documentclass[12pt]{article}
% you can set margin=0cm if you absolutely want no margin
\usepackage[a4paper, margin=1cm, right=0.5cm]{geometry}
\usepackage{fontspec}
\usepackage{setspace}

% Set Devanagari as main font
\setmainfont{Noto Sans Devanagari}
\newfontfamily\englishfont{Noto Sans}
\newcommand{\eng}[1]{{\englishfont#1}}

\begin{document}
% The first number (24) is the font size in points
% The second number (36) is the baseline skip - the distance between lines, also in points
\fontsize{24}{36}\selectfont

...devnatext... \eng{englishtest} ....more devnatext\\

{\small 2:30}

\end{document}
```

* Otheroptions

```tex
{\Huge heading}    % Largest
{\huge heading}    % Very large
{\LARGE heading}   % Large
{\Large heading}   % Moderately large
{\large heading}   % Slightly large

\vspace{1cm}     % Adds 1cm vertical space
% or
\vspace{2em}     % Adds 2 lines worth of space

```

Build the file

```sh
xalatex source.tex
```


# quit in the xaltex prompt

```
x

```

# combine pdf

```tex
\documentclass{article}
\usepackage[margin=0mm]{geometry}
\usepackage{pdfpages}

\begin{document}
\includepdf[pages=-,
    nup=1x2,          % Changed from 2x1 to 1x2 to get side-by-side
    landscape,
    delta=0 0mm,
    scale=0.95,
    offset=0 0mm,
    trim=0mm 0mm 0mm 0mm,
    frame=false
]{source.pdf}
\end{document}

```

Run the above as `xalatex combine.pdf`
