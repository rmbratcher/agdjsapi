#AGD JSAPI Build Docs#

Last update - 7/3/2013 4:30:44 PM 

##Prerequisites##
1. **Java** you must have JDK version 1.5 or greater installed and the following java utilities and libraries [download](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

	* apache ant [download](http://ant.apache.org/bindownload.cgi)
	* htmlcompressor.jar [download](http://code.google.com/p/htmlcompressor/downloads/list)
	* closure.jar [download](http://code.google.com/p/closure-compiler/wiki/BinaryDownloads?tm=2)
	* yuicompressor.jar [download](http://yuilibrary.com/download/#yuicompressor)
	
2. **Python** version 2.6 or greater installed and the following modules [download](http://python.org/download/)
	* python-setuptools *optional but recomended* [download](https://pypi.python.org/pypi/setuptools/0.7.7)
	* pip *(alternative to python-setuptools)* [download](http://www.pip-installer.org/en/latest/)
	* jinja2 python module
	
			Install with using easy_install (python-setuptools) or pip
				easy_install Jinja2
				pip install Jinja2

3. **Mercurial** [download](http://mercurial.selenic.com/downloads/)


##Request Access to the agdjsapi repository##
1. create an account at [bitbucket](http://bitbucket.org)
2. email mbratcher@atlasgeodata.com with your bitbucket username to gain read only access to the repository



##The ant build file##
1. Too much to cover here please see the [ant manual](http://www.oracle.com/technetwork/java/javase/downloads/index.html) 