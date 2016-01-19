@echo OFF

cd %~dp0

pushd planning
call ant clean
call ant deploy
popd

pushd public
call ant clean
call ant deploy
popd

pushd publicsafety
call ant clean
call ant deploy
popd

pause