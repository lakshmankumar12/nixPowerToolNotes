# To convert  jpeg to pdf
gs -sDEVICE=pdfwrite -o foo.pdf /usr/share/ghostscript/9.07/lib/viewjpeg.ps -c my.jpg viewJPEG

#or just convert
convert source.jpg target.pdf

# To convert  pdf to jpeg
# multiple pages
gs -dNOPAUSE -sDEVICE=jpeg -dFirstPage=1 -dLastPage=237 -sOutputFile=image%d.jpg -dJPEGQ=100 -r300x300 -q book.pdf -c quit
# single page
gs -dNOPAUSE -sDEVICE=jpeg -dFirstPage=1 -dLastPage=1 -sOutputFile=image.jpg -dJPEGQ=100 -r300x300 -q book.pdf -c quit


# combine pdf
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=combo.pdf pdf1.pdf pdf2.pdf
