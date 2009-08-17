import re

src = open("freemoviecompiler.php","r")
level = 0
local = {}
cls = None
startcls = False


def fix(s):
  s = s.replace(".","+")
  s = s.replace("$","")
  s = s.replace("this->","this.")
  s = s.replace(" or ", " || ")
  s = s.replace(" and "," && ")
  s = s.replace("\tand "," && ")
  s = s.replace(" elseif "," else if ")
  if "=>" in s:
    s = s.replace("array(","{")
    s = s.replace("=>",":")
    s = s[0:s.rfind(")")]+"};"
  else:
    s = s.replace("array()","[]")
  return s
  
def in_local(var):
  for lvl in local:
    if var in local[lvl]:
      return True
  return False
  
for line in src:
  line = line.rstrip()
  if "{" in line:
    level += 1
    local[level] = []
    #print "//Open ",level
  if "}" in line:
    local[level] = []
    level -= 1
    startcls = False
    #print "//Close ",level
    if level == 0:
      print "//KILLENDCLASS",
  if line.lstrip().startswith("//") or line.lstrip().startswith("#"):
    print "//",line.lstrip()
  elif line.lstrip().startswith("/*"):
    print line
  elif "*/" in line:
    print line
  elif line == "<?php":
    print "//START"
  elif line == "?>":
    print "//END"
  elif line.lstrip().startswith("for") and not line.lstrip().startswith("foreach"):
    print fix(line)," //FORARG"
  else:
    #line = line.replace("$this->","this.")
    line = line.replace("(int)","/*(int)*/")
    line = line.replace("(float)","/*(float)*/")
    var = re.search('\$(.+?) = (.+?);',line)
    idt = "\t"*((len(line)-len(line.lstrip())))
    if var:
      if var.group(1).startswith("this->"):
        if var.group(1).rstrip().endswith("[]"):
          print fix(var.group(1)).replace("[]",".push("),fix(var.group(2)).replace(";",""),");"
        else:  
          print fix(var.group(1))," = ",fix(var.group(2)),"; //TYPE A.b"
      elif in_local(var.group(1)) or "[" in var.group(1):
        if var.group(1).rstrip().endswith("[]"):
          print idt,fix(var.group(1)).replace("[]",".push("),fix(var.group(2)).replace(";",""),");"
        else:  
          print idt,fix(var.group(1))," = ",fix(var.group(2)),";"
      elif startcls == True:
        local[level].append(var.group(1))
        print idt,"this."+var.group(1)," = ",fix(var.group(2)),";"
      else:
        local[level].append(var.group(1))
        print idt,"var ",var.group(1)," = ",fix(var.group(2)),";"
      
    else:
      var = re.search('\$(.+?) .= (.+?);',line)
      if var:
        print idt,fix(var.group(1)),"+=",fix(var.group(2)),";"
      else:
        var = re.search('function (.+?)\((.*?)\)',line)
        if var:
          if cls is not None:
            if startcls == True:
              print "} //END CLASS DECLARATION"
            print cls+".prototype."+var.group(1)," = function(",fix(var.group(2)),")"
          else:
            print var.group(1)," = function(",fix(var.group(2)),")"
        else:
          var = re.search('class (.+?)$',line)
          if var:
            cls = var.group(1)
            startcls = True
            print "//Declare Class"
            print "function ",var.group(1),"()"
          else:
            var = re.search('foreach ?\((.+?) as (.+?)\) {',line)
            if var:
              print idt,"for(var _key in ",var.group(2),"){",var.group(2)," = ",var.group(2),"[_key]"
            else:
              print fix(line)
