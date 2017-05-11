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

# To reduce size of pdf having images
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
# option from smallest to largest
-dPDFSETTINGS=/screen lower quality, smaller size.
-dPDFSETTINGS=/ebook for better quality, but slightly larger pdfs.
-dPDFSETTINGS=/prepress output similar to Acrobat Distiller "Prepress Optimized" setting
-dPDFSETTINGS=/printer selects output similar to the Acrobat Distiller "Print Optimized" setting
-dPDFSETTINGS=/default selects output intended to be useful across a wide variety of uses, possibly at the expense of a larger output file
