!define APPNAME "Zzz"
!define VERSION "0.85.0"

Name "${APPNAME} ${VERSION}"
OutFile "../pkg/${APPNAME}Setup.exe"

ShowInstDetails show
RequestExecutionLevel User
InstallDir "$APPDATA\${APPNAME}"
DirText "Choose the folder in which to install ${APPNAME}"



Section
  SetOverwrite on
  SetOutPath "$INSTDIR\"

  File "..\dist\release\zzz.exe"
  File "..\LICENSE.md"

  MessageBox MB_YESNO "Create shortcut on Desktop?" IDNO NoCreateDesktop
  CreateShortCut "$DESKTOP\Zzz.lnk" "$INSTDIR\zzz.exe"

	NoCreateDesktop:
  CreateShortCut "$SMPROGRAMS\Zzz.lnk" "$INSTDIR\zzz.exe"

SectionEnd

Section -FinishSection
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section Uninstall
  SetDetailsView show
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"

  Delete "$INSTDIR\zzz.exe"
  Delete "$INSTDIR\LICENSE.md"

  Delete "$INSTDIR\uninstall.exe"
  Delete "$DESKTOP\Zzz.lnk"
  Delete "$SMPROGRAMS\Zzz.lnk"
  RMDir "$INSTDIR\"
SectionEnd

Function un.onInit
	MessageBox MB_YESNO|MB_DEFBUTTON2|MB_ICONQUESTION "Remove ${APPNAME} and all of its components?" IDYES DoUninstall
		Abort
	DoUninstall:
FunctionEnd
