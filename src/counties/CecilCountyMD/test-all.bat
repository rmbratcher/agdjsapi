@echo OFF

cd %~dp0

pushd planning
call ant clean
call ant test
popd

pushd public
call ant clean
call ant test
popd

pushd publicsafety
call ant clean
call ant test
popd

pause