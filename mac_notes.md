# General Desktop:

## Gestures:

* Same like chrombook:
   * 2 finger for scroll
   * 2 finger touch for right click
* New in MAC:
   * 3 finger up -> show all windows. This is called mission-control
   * 3 finger down ->
   * 3 finger left/right -> for window change (like alt-tab)

## window-top buttons

* Green-button           -- fullscreen
* Double-click on title  -- zoom
* Shift+Green-button     -- maximize w/o full-screen (Doesn't work?)

## Keyboard

* Command + Tab  -- alt tab between windows
* double-click   -- maximize w/o full-screen

* command + options + d  -> hide/unhide dock

* command + c - copy
* command + v - paste
* command + x - cut
* command + w - close tab/window
* command + option + w - close all windows/tabs


* control + down - show all windows of the current application (when u have multiple tabs of the same app)
* control + left/right -> switch desktop


* command + enter -> full-screen/out-of-full-screen

* show desktop - F11 (doest work on mac keyboard though)
               - Command + F3 in mac keyboard)

* command + control + spacebar  - character viewer/type emoji/unicode/uni-code chars

### force-quit

* command + option + Esc ->  Like ctrl-alt-del. Bring up Force-Quit manager.


## screen shots

* command + shift + 3 -> full screen
* command + shift + 4 -> arbitrary screen shot
* command + shift + 4, and then space -> screen shot of one app

* command + control + shift + 4 -> screen-shot in clipboard!

## Tabby-stuff (for iTerm/Chrome)

* command+t                       -- new tab
* Command + 1..9                  -- nth tab
* command + shift + [  ]          -- shift tabs
* command + shift + options [  ]  -- move tabs (doesn't work in chrome, but works for iterm)
  also
  * cmd   + shift + left/right    -- move tabs

# Mac Default shortcuts / global-hotkeys

* ctrl + F9 -> menu bar ( changed from F2.. doesn't work consistently on F2! )
* ctrl + F3 -> go to dock, then use up/down arrow
* ctrl + F8 -> status-buttons (volume/one-drive)
* F8        -> open notification
* F11       -> show desktop (Not exactly minimize all windows - useful if u feel like seeing the desktop picture!)
* control + up   -> Mission control (3 finger up in trackpad) (all windows splashing) (also use F3 in mac-keyboard)
* control + down -> show all windows of current app (3 finger down in trackpad)


* control + shift   + power  -  display off
* control + command + q      -  lock


## custom-set ones / my maps / global-hotkeys:


* ctrl + F7  -> launchpad            (Apparently this conflicts with way-tab moves focus.. But i dont think i care about this)

* ctrl + command + options + 4 - restart break timer
* ctrl + command + options + 5 - start break now
* ctrl + command + options + 6 - skip this break

* command + option + l -- iTerm
* command + option + k -- terminal

* command + option + u -- Chrome
* command + option + y -- Safari
* command + option + o -- Outlook

* command + option + b -- adobe
* command + option + n -- preview
* command + option + r -- finder

* command + option + p -- Play-Music-App
* command + option + a -- audacity
* command + option + c -- slack

* command + option + , -- qutebrowser
* command + option + / -- pandora-play pause
* command + option + m -- t-mobile digits

* command + option + e -- Global hot-key for iterm's hotkey-profile


### Available:
* j

### not sure

* g
* h
* q
* s
* t
* v
* w
* x
* z

### Dont use

* i -> its for chrome dev options.
* f -> its for find in outlook & full-size in spectacle.
* d -> its toggle for auto-hide in dock
* left/right arrow -> they are used for resize in spectacle

### this is retired. I am no longer using it.

(These are set using automator as services. You should see them in App->services in menu-bar for them to work)
* command + control + option - 7  -- iTerm
* command + control + option - 8  -- outlook
* command + control + option - 9  -- chrome
* command + shift + l --  lock screen


## Spectacle-window-shortcuts

* command + option + f  - full screen
* command + option + left   - make window left side  / cycle between half-left, one-third left, 2-3rd left
* command + option + right  - make window right side


* ctrl + command + options + left   - change monitor
* ctrl + command + options + right  - change monitor

* ctrl + options + shift + left   - minimize (make smaller)
* ctrl + options + shift + right  - maximize (make larger)

* command + shift + m --  zoom/maximize (doesnt work?)

# Things to Know/Terminologies

* Mission Control -> The all windows splashing stuff
* LaunchPad       -> Grid of apps
* Spotlight       -> mac's default keyboard-based app laucher on cmd-space (i have mapped to ctrl-space)
* MenuBar         -> Top bar in mac
  * Apple menu
  * App menu
  * status menu
* Dashboard       -> Grid of widgets. I have switched this off. Useless for me.

## Folders of interest in mac

* /Applications                      -- all apps are here.1
* /Users/lakshman.narayanan/.Trash   -- trash!

# Text Movements:

* command + left/right : Jump start of line/end of line
* option  + left/right : Jump start of word      --- MOST FREQUENT NEED
* command + up/down : Jump para'ish

# App specifics

## chrome

* command+click       -> open link in new tab
* command+shift+click -> open link in new tab + focus   # MOST USED
* command+l           -> address bar

* command+up/down     -> Goto top of page/bottom of page.   # Useful suprising more often.

* command+option+i    -> developer tools
* command+option+u    -> see source

* command+[   /]      -> back/forward
* command+left/right  -> back/forward

## iTerm


* Command +   +/-  -->  Font size increase decrease

The current-line highlight gets enabled because of command + option + ;

mine:
* shift-command-d  --> create new split-pane vertical
* command+shift +/-  -> size of pane
* shit+command+enter --> zoom out pane

## Outlook

* Command + T          --> mark an item as read.
* Command + Option + F --> search
* Command + Shift  + F --> Advanced search

* Control + Shift + [ / ] --> next/prev panes

* Command +  +/-       --> Font size increase

* ctrl + option + 1    --> Move to folder

## Finder

* Command-up   -> one folder up
* Command-down -> go into selected foler (like enter)

* command +backsapce -> move to trash
* command + option + backsapce -> direct delete /w/o trash

* command + shift + n -> create new folder

### Get the pwd of current folder

* Simply go one level up, drag the folder icon to terminal.
  (You can drag it to any where a folder is expected)

## command-line tools

### Dont make mac go to sleep
```
#-t <>  time in sec, omit it if u want forever
#-d     dont display sleep
#-i     dont idle sleep (Whatever is that from normal sleep)
#-m     no disk sleep
#-s     no sleep on ac-power
caffeinate -t 3600 -d -m -i -s &
```

### Pop-up a message

```
osascript -e 'display notification "Lorem ipsum dolor sit amet" with title "Title"'
```


## View pictures/photos

* Open folder in finder
* Press spacebar on a picture. This will open the picture in finder itself
* Then use up/down to scroll pictures!

## Restart dock

```
#when some icon has notification info stuck
killall Dock
```

### windirstat for mac

omnidisksweeper

# YET TO FIND:

* how to shift tabs (as in 3 finger scroll in chromebook) with gesture

# Wish List

* Some nice way to sepearate 2 chrome windows and go to a paritcular instance on choice.
   Thus work-related tabs is in one chrome, while personal tabs are in another

# Quick-Silver

http://mac.appstorm.net/how-to/productivity-how-to/mastering-quicksilver-the-basics/

## Open chrome tabs from quick-silver

* Type chrome in quick-silver, right-arrow -> open-web-page --> (You should see your tabs here!)
*  Now press-tab to the execute item
  * Here, you should choose reveal tab

# blueutil

```
blueutil --recent

blueutil --connect 38-a2-8c-bf-32-e6

#status
blueutil -p
#on/off
blueutil -p 0
blueutil -p 1
```


# Login wall paper

sudo chflags nouchg /Library/Caches/com.apple.desktop.admin.png

# Command line tools

```
diskutil list
diskutil eject /dev/disk2
diskutil unmountDisk /dev/disk2

hdiutil convert -format UDRW -o dest.img origen.iso
sudo dd if=dest.img.dmg of=/dev/rdisk2 bs=1m

#another way is to gui-format the disk to Master-boot-record + FAT32 using disk-utility
# ensure to have "devices shown" in options.


hdiutil convert a.img -format UDRW -o writable.img
#hdiutil attach -imagekey diskimage-class=CRawDiskImage -nomount filename
hdiutil attach -nomount filename
diskutil list
diskutil mountDisk /dev/disk<N>
```

## Create linux/win bootable iso-usb

http://darraghking.com/create-a-bootable-windows-10-usb-installer-with-a-mac/

* Disk-utility .. erase MBR(Fat)
```
diskutil unmountDisk /dev/SOMEdisk2

sudo fdisk -e /dev/SOMEdisk2
print
f 1
write
print
exit
diskutil unmountDisk /dev/SOMEdisk2

sudo dd conv=notrunc bs=440 count=1 if=mbr.bin of=/dev/diskN
```


unetbootin is POISON. it adds a unet menu to all linux files.

## Xterm from other machines

open up DISPLAY from other machines.
xhost +


## cpu info

sysctl -a | grep machdep.cpu

# Whcih apps start at startup

System-Preferences -> Users&Groups -> You -> LoginItems


# NFS in mac

showmount -e mforge2

sudo mount -t nfs mforge2:/export/home/lakshman_narayanan /Users/lakshman.narayanan/forge_home

sudo umount /Users/lakshman.narayanan/forge_home


# Access the docker installed linux-VM:

```
#note this is tty:
screen ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux/tty
```

# Paint in MAC

Just use preview.

You can open a blank white image and start drawing on it. Click the icon left ot search window in top right corner.


# Change default app in mac

* Right click the file of the type
* Click Get-Info
* Scroll down and exapand open-with
* Choose your app from drop down and click change-all

# change screenshot location in mac

```
defaults write com.apple.screencapture location /Users/lakshman.narayanan/Downloads/screenshots
killall SystemUIServer
```
# Printers

http://localhost:631/printers/
