# gs based operations

## extract a subset of pages

```sh
infile=..
outfile=..
spage=..
epage=..
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -q \
   -dFirstPage=$spage \
   -dLastPage=$epage \
   -sOutputFile=$outfile \
   $infile

## args explained
###    -dNOPAUSE -- dont enter interactive prompt
###    -dBATCH   -- quit after done. Def is to enter interactive prompt
###    -dSAFER   -- avoid unsafe operations (following links etc..)
###    -q        -- quiet mode.. no unnecessary startup messages
###    -c "postscript code"  -- note when -c is used, you need to use -f to tell next is input

## or with qpdf
qpdf --empty --pages $infile $spage-$epage -- $outfile
sudo docker run --user root -it --rm -v $PWD:/pdf ghcr.io/toshy/docker-qpdf:latest --empty --pages /pdf/$infile $spage-$epage -- /pdf/$outfile
```

## combine pdfs

```sh
gs -dBATCH -dNOPAUSE -dSAFER -q -sDEVICE=pdfwrite -sOutputFile=output.pdf \
   -dFirstPage=1 -dLastPage=3 input1.pdf \
   -dFirstPage=2 -dLastPage=4 input2.pdf

# if you want whole of input
gs -dBATCH -dNOPAUSE -dSAFER -q -sDEVICE=pdfwrite -sOutputFile=output.pdf \
   input1.pdf input2.pdf
```

* with pdftk

```sh
pdftk A=in1.pdf B=in2.pdf cat A1-2 B4-end output out1.pdf
pdftk *pdf cat output combined.pdf
```

## rotate pdf

```sh
# Create a file named rotate.txt with the rotation instructions
echo "[/Page 1 /Rotate 90 /DELETE pdfmark" > rotate.txt

# Use gs to apply the rotation
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=rotated.pdf \
   rotate.txt input.pdf

## 90 - clockwise, 270 - anti-clockwise , 180 upside-down
cat <<EOF > rotate.txt
[/Page 1 /Rotate 90 /DELETE pdfmark
[/Page 3 /Rotate 180 /DELETE pdfmark
[/Page 5 /Rotate 270 /DELETE pdfmark
EOF

## rotate full file
## 1 - anit-clockwsie, 2-upside down, 3 - clockwise
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=rotated.pdf \
   -c "<</Orientation 3>> setpagedevice" \
   -f input.pdf

```
* with pdftk
```sh
# rotate the first PDF page to 90 degrees clockwise
pdftk in.pdf cat 1east 2-end output out.pdf

# rotate an entire PDF document to 180 degrees
pdftk in.pdf cat 1-endsouth output out.pdf
```


# password related

```sh
# remove password
# or simply open in evince and print!
pdftk protected.pdf input_pw sekritPassword cat output unprotected.pdf
```

* qpdf is cool - it tries both user password and owner password. Use this.
```sh
cd ...wherever
# inffile and outfile should be just basenames .. RUn this in the folder where your in is.
infile=..
outfile=..
password=...

#    docker run             -it --rm -v $PWD:/pdf -v $PWD:/outdir ghcr.io/toshy/docker-qpdf:latest --password=$password --decrypt /pdf/$infile /outdir/$outfile
sudo docker run --user root -it --rm -v $PWD:/pdf -v $PWD:/outdir ghcr.io/toshy/docker-qpdf:latest --password=$password --decrypt /pdf/$infile /outdir/$outfile
qpdf --password=$password --decrypt $infile $outfile
```

## standard scripts

```sh
sudo docker run --user root -it --rm -v $PWD:/pdf --entrypoint=/bin/bash ghcr.io/toshy/docker-qpdf:latest
#crack password for DOB - DDMMYYYY as password
file=...
start="19800101" ## should be in YYYMMDD for date cmd to pick
for i in $(seq 0 $((30*366)) )  ; do
    password=$(date --date="$start + $i day" +'%d%m%Y');
    ##password="laks$(date --date="$start + $i day" +'%d%m')";  ## .. for laksDDMM
    echo qpdf --password=$password --decrypt ${file} a.pdf
    qpdf --password=$password --decrypt ${file} a.pdf
    if [ -f a.pdf ] ; then
        break;
    fi
done

## note - if you do double loops remember to exit all on if file.

## other for loop
for a in {A..Z} ; do echo $a ; done
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

# print 2 pages per sheet

*  Search : multiple 2x1 2x2
```sh
pdfjam --nup 2x1 --landscape input.pdf --outfile output.pdf
```

# get font info from pdf

```sh
pdffonts document.pdf

```


# watermarking

* works only for text-files).
```sh
pdftk input.pdf background mark.pdf output marked-file.pdf
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
pdftotext -layout -f $first -l $last $infile $outfile
pdftotext -layout $infile $outfile
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


# tool to remove a particular image out of a pdf

search: insurance filler amma maxbupa niva

```
inkscape

```

