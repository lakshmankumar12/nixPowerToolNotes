

# password related

```sh
# remove password
# or simply open in evince and print!
pdftk protected.pdf input_pw sekritPassword cat output unprotected.pdf
```

* when u know only user password
```sh
qpdf --password=sekritPassword --decrypt protected.pdf unprotected.pdf
```

## standard scripts

* by 4 digit numbers

```sh
#crak password of unknown pdf
protected=
unprotected=a.pdf
for i in $(seq 0 9999) ; do
    pass=$(printf "laks%04d" $i)
    echo "Trying $pass"
    qpdf --password=$pass --decrypt ${protected} ${unprotected}
    if [ $? -eq 0 ] ; then
        break
    fi
done
```

* crack dates -- see below for full year also.
```sh
for month in $(seq 1 12) ; do
    for day in $(seq 1 31) ; do
        pass=$(printf "laks%02d%02d" $day $month)
        echo "Trying $pass"
        qpdf --password=$pass --decrypt ${protected} ${unprotected}
        if [ $? -eq 0 ] ; then
            break
        fi
    done
done
```

```sh
file=...
start="19750101"
for i in $(seq 0 $((30*365)) )  ; do
    passwd=$(date --date="$start + $i day" +'%d%m%Y');
    echo $passwd
    qpdf --password=${passwd} --decrypt ${file} a.pdf
    if [ $? -eq 0 ] ; then
        break;
    fi
done
```

## Add password

The user password, if set, is what you need to provide in order to open a PDF.
Acrobat/Reader will prompt a user to enter the user password. If it's not
correct, the document will not open.

The owner password, if set, controls permissions, such as printing, editing,
extracting, commenting, etc. Acrobat/Reader will disallow these things
based on the permission settings. Acrobat will require this password if you
want to set/change permissions.

```sh
#Encrypt a PDF using 128-bit strength (the default), withhold all permissions (the default)
pdftk 1.pdf output 1.128.pdf owner_pw foopass

#Same as above, except password baz must also be used to open output PDF
pdftk 1.pdf output 1.128.pdf owner_pw foo user_pw baz

#Same as above, except printing is allowed (once the PDF is open)
pdftk 1.pdf output 1.128.pdf owner_pw foo user_pw baz allow printing
```

# Merge 2 pdfs

```sh
pdftk A=in1.pdf B=in2.pdf cat A1-2 B4-end output out1.pdf
pdftk *pdf cat output combined.pdf
```

* using gs

```sh
gs -dNOPAUSE -sDEVICE=pdfwrite -sOUTPUTFILE=combine.pdf -dBATCH 1.pdf 2.pdf
```


# print 2 pages per sheet

*  Search : multiple 2x1 2x2
```sh
pdfjam --nup 2x1 --landscape input.pdf --outfile output.pdf
```

# watermarking

* works only for text-files).
```sh
pdftk input.pdf background mark.pdf output marked-file.pdf
```

# rotating pdf

```sh
# rotate the first PDF page to 90 degrees clockwise
pdftk in.pdf cat 1east 2-end output out.pdf

# rotate an entire PDF document to 180 degrees
pdftk in.pdf cat 1-endsouth output out.pdf
```

# extract a image/jpeg/picture from a pdf


```sh
convert -verbose -density 150 -trim file.pdf -quality 100 -sharpen 0x1.0 output.jpg
```

```sh
## Note if you get security error: do
#    attempt to perform an operation not allowed by the security policy `PDF' @ error/constitute.c/IsCoderAuthorized/408.
### reference: https://stackoverflow.com/a/53180170/2587153
# open /etc/ImageMagick-*/policy.xml
#   edit the line with
#   <policy domain="coder" rights="none" pattern="PDF" />
#     to
#   <policy domain="coder" rights="read | write" pattern="PDF" />
```

# meta info from pdf

* Get no of pages
```sh
pdftk my.pdf dump_data | grep NumberOfPages
```

# pdf to text

```sh
apt-get  install poppler-utils
pdftotext -layout a.pdf a.txt
pdftotext -layout -f <first-pagenum> -l <last-page-num> a.pdf a.txt
```

# convert pdf to black and white

```sh
input=...
output=${input%.pdf}-bw.pdf
gs      -sOutputFile=${output} \
        -q -dNOPAUSE -dBATCH -dSAFER \
        -sDEVICE=pdfwrite \
        -dCompatibilityLevel=1.3 \
        -dPDFSETTINGS=/screen \
        -dEmbedAllFonts=true \
        -dSubsetFonts=true \
        -sColorConversionStrategy=/Mono \
        -sColorConversionStrategyForImages=/Mono \
        -sProcessColorModel=/DeviceGray \
        ${input}

gs \
 -sOutputFile=${output} \
 -sDEVICE=pdfwrite \
 -sColorConversionStrategy=Gray \
 -dProcessColorModel=/DeviceGray \
 -dCompatibilityLevel=1.4 \
 -dNOPAUSE \
 -dBATCH \
 ${input}
```

# convert pdf to image

```sh
gs                              \
  -o image-name.tiff \
  -sDEVICE=tiffg4               \
  -r1200                        \
  -dAutoRotatePages=/PageByPage \
   infile.pdf
```

