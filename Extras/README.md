# VM config file setup (UBUNTU SERVER)

#### Prerequisites
* Make the install script and executable by running in `chmod +x install.sh` terminal
* Run `configure.sh` with **superuser** privileges

#### To use VBox Shared Folders with Node.js
* On the host run:
*UNIX: * `VBoxManage setextradata VM_NAME VBoxInternal2/SharedFoldersEnableSymlinksCreate/SHARE_NAME 1`

*WINDOWS: * `VBoxManage.exe setextradata VM_NAME VBoxInternal2/SharedFoldersEnableSymlinksCreate/SHARE_NAME 1`

where VM_NAME is the name of your virtual machine (e.g Ubuntu) and SHARE_NAME the name of your shared directory (without the "sf_" prefix).

*RESTART Virtual Machine and VBox*

The Shared folder is under /media/sf_<share name>

If there are still issues run VBox with admin privilidges.


#### Setup VMWare Tools on Ubuntu Server
https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1022525