# Retrieve a list

To create key (to run in shell)
https://console.developers.google.com
 » credentials
   » API key
     (Remember to delete this once you are done, to avoid quota theft!)

developer console
https://console.developers.google.com
» library
    » youtube-data-api
      »  Try this api in a explorer
        »  youtube.playlistItems.list
          » Make sure you use playlistId and not plain Id. (just scroll down for it)
          » part=snippet & playlistId = "id" & maxResults = 50
            » execute

# Get thumbnail Pictures

* small 320x180
    http://img.youtube.com/vi/$VIDEOID/mqdefault.jpg
* medium 480x360
    http://img.youtube.com/vi/$VIDEOID/0.jpg
* high 1280x720 or 1920x1080 (only if 720p or 1080p)
    http://img.youtube.com/vi/$VIDEOID/maxresdefault.jpg

# Link in browser

* normal just watch a video
  https://www.youtube.com/watch?v=$VIDEOID

* start at a time
  https://www.youtube.com/watch?v=$VIDEOID&t=100s

* start a list at a particular index (you need to know the video-id of the N-th video too!)
  https://www.youtube.com/watch?v=$VIDEOID&list=$LISTID&index=N

# youtube-dl

```sh
export LISTID=<13-char-id>
export VIDEOID=<11-char-id>

#List all available formats to download
youtube-dl -F $VIDEOID

#List all information as json
youtube-dl -j $VIDEOID
youtube-dl -j $VIDEOID | pretty_json.py | grep "description" | sed 's#\\n#\n#g' | less


#typically 140 has audio
youtube-dl -f 140 $VIDEOID
```

* options
```sh
-o <filename>  saves in that filename.
```

# yt-dlp

* Installing
```sh
brew install yt-dlp

## downlaod only audio
yt-dlp -f 140 $id

## download transcript
yt-dlp --write-auto-sub --convert-subs=srt --skip-download $id
```

