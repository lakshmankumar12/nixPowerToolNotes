# MP3 manipulation

## avconv or ffmpeg examples

### For amma's phone

```
ffmpeg -strict experimental -i test-1.mp4 -f 3gp -t 00:00:30 -r 15 -s qcif -vcodec mpeg4  -acodec aac test-1.3gp
```

### To just see what's in a file

```
ffmpeg -i test-1.mp4 
```

### For nokia-x6


```
ffmpeg -strict experimental -i ../../rhymes/12345-once-i.webm -f mp4 -s ega -vcodec mpeg4 -acodec libmp3lame 12345-once-i.mp4
```

### Only audio

```
ffmpeg -i he-hookah-i/cd-1.m4v -acodec libmp3lame -vn cd1.mp3
```

### For chroma player

```
avconv -strict experimental -i ~/Lakshman/rhymes/12345-once-i.webm -f avi -s qvga -r 20 -vcodec libxvid -acodec libmp3lame 12345-once-i.avi
```

### To merge 2 or more files

```
avconv -i 'concat:first.mp3|second.mp3|third.mp3' final.mp3
```
For video files (mp4 files) this doesn't work. use MP4Box from `sudo apt-get install gpac` instead.

```
MP4Box -cat video1.mp4 -cat video2.mp4 -cat video3.mp4 -new final.mp4
```

### Merge audio and video

```
avconv -i audio.mp3 -i video.mp4 -acodec copy -vcodec copy mixed.mp4
```



## Extract subset of time


strip minutes out

```
avconv -i yourmovie.whatever -ss starttime -t duration -sameq outputfile
avconv -i Rasanubhavam.mp3 -ss 00:56:58 -t 00:02:31 -acodec copy thillana-Kamas.mp3
```

or if end position is known,

```
avconv -i Rasanubhavam.mp3 -ss 00:56:58 -to 01:06:43 -acodec copy thillana-Kamas.mp3
```

### copy desktop

```
avconv -f alsa -i default -f x11grab -r 30 -s <*> -i :0.0 -acodec flac -vcodec libx264 -threads 0 output.mkv
avconv -f alsa -i default -f x11grab -r 30 -s 1920x1200 -i :0.0 -acodec flac -vcodec libx264 -threads 0 output.mkv
avconv -f alsa -i default -f x11grab -r 30 -s 1024x768  -i :0.0 -acodec flac -vcodec libx264 -threads 0 output.mkv
```

* use xrandr to find out what to give.

### Available sizes (-s)

* vga (640×480)
* svga (800×600)
* xga (1024×768)
* uxga (1600×1200)
* hd480 (852×480)
* hd720 (1280×720)
* hd1080 (1920×1024).

# ID3V2 commands

These are the required tags

* TIT2 (Title/songname/content description)

  The Title

* TALB (Album/Movie/Show title)

  Album

* TPE1 (Lead performer(s)/Soloist(s))

  Artist

* TPE2 (Band/orchestra/accompaniment)

  Album Artist

* TCON (Content type):

  Genre

* TRCK (Track number/Position in set)

  Track number

* TYER (Year)
* APIC (Attached picture)

  Image


## To set any frame

```
id3v2 --TIT2 'Title of Track' file.mp3
```

## To remove a frame

```
id3v2 --remove-frame 'TXXX' file.mp3
```

## To add image

```
eyeD3 --add-image 'cover.jpg:FRONT_COVER' Akhilandeshwari.mp3
\ls *.mp3 | while read i ; do eyeD3 -2 --add-image 'cover.jpg:FRONT_COVER' $i ; done
```

## To remove image

```
eyeD3 --remove-images file.mp3
```

## To remove v1 tag

```
id3v2 -s file.mp3
```

## To just know the image

Create a folder and extract the image to that folder

```
mkdir -p check; eyeD3 --write-images=check *.mp3
```

## mac aiff to mp3

```
avconv -i "1 Audio Track.aiff" -acodec libmp3lame -ab 192k "1 Audio Track.mp3"
```


## record ustreamer.service

https://stackoverflow.com/a/52081149

```sh
ffmpeg -use_wallclock_as_timestamps 1 -f mjpeg -i "http://localhost:8001/stream" -t 30 -c copy -y output.mp4
```

