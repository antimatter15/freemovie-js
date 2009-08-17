//START

// //---------------------------------------------------------------
// //  file flashmoviecompiler.php

// //---------------------------------------------------------------
// //  FreeMovieCompiler -- Macromedia Flash (SWF) file generator
// //
// //  Copyright (C) 2001, 2002 Jacek Artymiak
// //
// //  Permission is hereby granted, free of charge, to any person
// //  obtaining a copy of this software and associated
// //  documentation files (the "Software"), to deal in the Software
// //  without restriction, including without limitation the rights
// //  to use, copy, modify, merge, publish, distribute, sublicense,
// //  and/or sell copies of the Software, and to permit persons to
// //  whom the Software is furnished to do so, subject to the
// //  following conditions:
// //
// //  The above copyright notice and this permission notice shall
// //  be included in all copies or substantial portions of the
// //  Software.
// //
// //  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
// //  KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// //  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// //  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL JACEK
// //  ARTYMIAK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// //  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// //  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// //  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// //
// //  Except as contained in this notice, the name of Jacek Artymiak
// //  shall not be used in advertising or otherwise to promote the
// //  sale, use or other dealings in this Software without prior
// //  written authorization from Jacek Artymiak.
// //
// //  For more information write to jacek@artymiak.com or
// //  artymiak@safenet.pl. Failing that visit
// //  http://freemovie.sourceforge.net or http://www.devguide.net
// //
// //  Mailing address:
// //  ----------------
// //  Jacek Artymiak
// //  P.O. Box 69
// //  Lublin 1
// //  Lublin
// //  20-001
// //  woj. lubelskie
// //  POLAND

// //---------------------------------------------------------------
// //  Class FreeMovieCompiler defines an SWF file object.  Its
// //  methods and properties are used to create a Flash movie.

//Declare Class
function  FreeMovieCompiler ()
{
	this.Cal_mode  =  true ;

	this.SWFVersion  =  0 ;
// // change it or GetSWFVersion to
// // read it

	this.SWFVersionLowerLimit  =  1 ;
	this.SWFVersionUpperLimit  =  6 ;

	this.FrameSize  =  {"Xmin" : 0, "Xmax" : 11000, "Ymin" : 0, "Ymax" : 8000}; ;
	this.FrameRate  =  12+5 ;
	this.BackgroundColor  =  {"R" : 0, "G" : 0, "B" : 0}; ;

	this.MovieData  =  "" ;

	this.FrameCounter  =  0 ;
	this.CharacterDepth  =  0 ;

	this.Bitmaps  =  [] ;

	this.FMDebug  =  [] ;

// //-------------------------------------------------------
// // the theoretical limit is 65535, but older versions of
// // Flash Player cannot display layers above 16000.

// #var $LayerLimit = 65535;
	this.LayerLimit  =  16000 ;

// //-------------------------------------------------------
// // the theoretical limit is 65535, but older versions of
// // Flash Player cannot display frames beyond 16000.

// #var $FrameNumberLimit = 65535;
	this.FrameNumberLimit  =  16000 ;

	this.CharacterIDLimit  =  65535 ;
	this.CharacterID  =  0 ;

// //-------------------------------------------------------
// //  string FMError(string message)
// //  displays error messages.

} //END CLASS DECLARATION
FreeMovieCompiler.prototype.FMError  = function( message )
	{
		this.trace  =  "" ;

		for(var _key in  $level ){ $level  =  $level [_key]
			trace += " > " + level ;
		}

		error_log ("freemoviecompiler error: trace --> message");

		exit;
	}

// //-------------------------------------------------------
// //  string FMWarning(string message)
// //  displays warnings messages.

FreeMovieCompiler.prototype.FMWarning  = function( message )
	{
		var  trace  =  "" ;

		for(var _key in  $level ){ $level  =  $level [_key]
			trace += " > " + level ;
		}

		error_log ("freemoviecompiler warning: trace --> message");
	}

// //------------------------------------------------//
// //                                                //
// //                 Basic types                    //
// //                                                //
// //------------------------------------------------//

// //-------------------------------------------------------
// //  string packUI8(integer number)
// //  converts the given 8-bit unsigned integer number into
// //  an SWF UI8 atom.

FreeMovieCompiler.prototype.packUI8  = function( number )
	{
		array_push(this.FMDebug, "packUI8");

		if (!(is_numeric(number))) {

			this.FMError("packUI8 argument number not a number");
		}

		var  number  =  /*(int)*/ number ;

		var  lower_limit  =  0 ;
		var  upper_limit  =  255 ;

		if (number < lower_limit) {

			number  =  lower_limit ;
		}

		if (number > upper_limit) {

			number  =  upper_limit ;
		}

		var  atom  =  String.fromCharCode(number) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //-------------------------------------------------------
// //  string packUI16(integer number)
// //  converts the given 16-bit unsigned integer into an
// //  SWF UI16 atom.

FreeMovieCompiler.prototype.packUI16  = function( number )
	{
		array_push(this.FMDebug, "packUI16");

        	if (!(is_numeric(number))) {

                	this.FMError("packUI16 argument not a number");
        	}

		var  number  =  /*(int)*/ number ;

		var  lower_limit  =  0 ;
		var  upper_limit  =  65535 ;

		if (number < lower_limit) {

			number  =  lower_limit ;
		}

		if (number > upper_limit) {

			number  =  upper_limit ;
		}

		number  =  sprintf("%04x", number) ;

		var  low_byte   =  base_convert(substr(number, 2, 2), 16, 10) ;
		var  high_byte  =  base_convert(substr(number, 0, 2), 16, 10) ;

		var  atom   =  String.fromCharCode(low_byte) + String.fromCharCode(high_byte) ;

		array_pop(this.FMDebug);

        	return atom;
	}

// //-------------------------------------------------------
// //  string packUI32(integer number)
// //  converts the given unsigned integer into an SWF
// //  UI32 atom and returns it.

FreeMovieCompiler.prototype.packUI32  = function( number )
	{
		array_push(this.FMDebug, "packUI32");

	        if (!(is_integer(number))) {

        	        this.FMError("packUI32 argument not an integer");
        	}

		var  lower_limit  =  0 ;
		var  upper_limit  =  2147483647 ;
// # but PHP 4 cannot handle such
// # large unsigned integers

	        if (number < lower_limit) {

			var  number  =  lower_limit ;
		}

		if (number > upper_limit) {

			var  number  =  upper_limit ;
        	}

		var  number  =  sprintf("%08x", number) ;

		var  low_byte_low_word   =  base_convert(substr(number, 6, 2), 16, 10) ;
		var  high_byte_low_word  =  base_convert(substr(number, 4, 2), 16, 10) ;

		var  low_byte_high_word   =  base_convert(substr(number, 2, 2), 16, 10) ;
		var  high_byte_high_word  =  base_convert(substr(number, 0, 2), 16, 10) ;

		var  atom   =  String.fromCharCode(low_byte_low_word)  + String.fromCharCode(high_byte_low_word) ;
		atom += String.fromCharCode(low_byte_high_word) + String.fromCharCode(high_byte_high_word) ;

		array_pop(this.FMDebug);

        	return atom;
	}

// //-------------------------------------------------------
// //  string packSI8(integer number)
// //  converts the given 8-bit signed integer into an SWF
// //  SI8 atom.

FreeMovieCompiler.prototype.packSI8  = function( number )
	{
		array_push(this.FMDebug, "packSI8");

		if (!(is_numeric(number))) {

			this.FMError("packSI8 argument not a number");
		}

		var  number  =  /*(int)*/ number ;

		var  lower_limit  =  -127 ;
		var  upper_limit  =  127 ;

		if (number < lower_limit) {

			number  =  lower_limit ;
		}

		if (number > upper_limit) {

			number  =  upper_limit ;
		}

		if (number < 0) {

			number  =  upper_limit + 1 + Math.abs(number) ;
		}

		var  atom  =  String.fromCharCode(number) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //-------------------------------------------------------
// //  string packSI16(integer number)
// //  converts the given 16-bit signed integer into an SWF
// //  SI16 atom.

FreeMovieCompiler.prototype.packSI16  = function( number )
	{
		array_push(this.FMDebug, "packSI16");

		if (!(is_numeric(number))) {

			this.FMError("packSI16 argument not a number");
		}

		var  number  =  /*(int)*/ number ;

		var  lower_limit  =  -32767 ;
		var  upper_limit  =  32767 ;

		if (number < lower_limit) {

			number  =  lower_limit ;
		}

		if (number > upper_limit) {

			number  =  upper_limit ;
		}

		if (number < 0 ) {

			number  =  upper_limit + 1 + Math.abs(number) ;
		}

		number  =  sprintf("%04x", number) ;

		var  low_byte   =  base_convert(substr(number, 2, 2), 16, 10) ;
		var  high_byte  =  base_convert(substr(number, 0, 2), 16, 10) ;

		var  atom   =  String.fromCharCode(low_byte) + String.fromCharCode(high_byte) ;

		array_pop(this.FMDebug);

        	return atom;
	}

// //-------------------------------------------------------
// //  string packSI32(integer number)
// //  converts the given 32-bit signed integer into an SWF
// //  SI32 atom.

FreeMovieCompiler.prototype.packSI32  = function( number )
	{
		array_push(this.FMDebug, "packSI32");

	        if (!(is_numeric(number))) {

        	        this.FMError("packUI32 argument not a number");
        	}
		var  lower_limit  =  -2147483647 ;
		var  upper_limit  =  2147483647 ;

		if (number < lower_limit) {

			var  number  =  lower_limit ;
		}

		if (number > upper_limit) {

			var  number  =  upper_limit ;
		}

		if (number < 0) {

			var  number  =  upper_limit + 1 + Math.abs(number) ;
		}

		var  number  =  sprintf("%08x", number) ;

		var  low_byte_low_word   =  base_convert(substr(number, 6, 2), 16, 10) ;
		var  high_byte_low_word  =  base_convert(substr(number, 4, 2), 16, 10) ;

		var  low_byte_high_word   =  base_convert(substr(number, 2, 2), 16, 10) ;
		var  high_byte_high_word  =  base_convert(substr(number, 0, 2), 16, 10) ;

		var  atom   =  String.fromCharCode(low_byte_low_word)  + String.fromCharCode(high_byte_low_word) ;
		atom += String.fromCharCode(low_byte_high_word) + String.fromCharCode(high_byte_high_word) ;

		array_pop(this.FMDebug);

        	return atom;
	}

// //-------------------------------------------------------
// //  string packFIXED8(float number)
// //  converts the given signed floating-point number into
// //  an SWF FIXED 8.8 atom.

FreeMovieCompiler.prototype.packFIXED8  = function( number )
	{
		array_push(this.FMDebug, "packFIXED8");

		var  lower_limit_high_byte  =  -127 ;
		var  upper_limit_high_byte  =  127 ;
		var  lower_limit_low_byte  =  0 ;
		var  upper_limit_low_byte  =  99 ;

	        if (!(is_numeric(number))) {

        	        this.FMError("packFIXED8 argument not a number");
        	}

		var  number  =  Math.round(number, 2) ;

		var  high_byte  =  parseInt(number) ;

		if (high_byte < lower_limit_high_byte) {

			high_byte  =  lower_limit_high_byte ;
		}

		if (high_byte > upper_limit_high_byte) {

			high_byte  =  upper_limit_high_byte ;
		}

		var  low_byte  =  /*(int)*/ ((Math.abs(number) - parseInt(Math.abs(number))) * 100) ;

		var  atom   =  this.packUI8(parseInt(low_byte * 256 / 100)) ;
		atom += this.packSI8(high_byte) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //-------------------------------------------------------
// //  string packFIXED16(float number)
// //  converts the given signed floating-point number into
// //  an SWF FIXED 16.16 atom.

FreeMovieCompiler.prototype.packFIXED16  = function( number )
	{
		array_push(this.FMDebug, "packFIXED16");

		var  lower_limit_high_word  =  -32767 ;
		var  upper_limit_high_word  =  32767 ;
		var  lower_limit_low_word  =  0 ;
		var  upper_limit_low_word  =  9999 ;

	        if (!(is_numeric(number))) {

        	        this.FMError("packFIXED16 argument not a number");
        	}

		var  number  =  Math.round(number, 4) ;

		var  high_word  =  parseInt(number) ;

		if (high_word < lower_limit_high_word) {

			high_word  =  lower_limit_high_word ;
		}

		if (high_word > upper_limit_high_word) {

			high_word  =  upper_limit_high_word ;
		}

		var  low_word  =  /*(int)*/ ((Math.abs(number) - parseInt(Math.abs(number))) * 10000) ;

		var  atom   =  this.packUI16(parseInt(low_word * 65536 / 10000)) ;
		atom += this.packSI16(high_word) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //-------------------------------------------------------
// //  string packUBchunk(integer number)
// //  converts the given 31-bit unsigned integer number into
// //  an SWF UB atom.

FreeMovieCompiler.prototype.packUBchunk  = function( number )
	{
		array_push(this.FMDebug, "packUBchunk");

		var  lower_limit  =  0 ;
		var  upper_limit  =  2147483647 ;

		if (!(is_numeric(number))) {

			this.FMError("packUBchunk argument not a number");
		}

		if (number < lower_limit) {

			var  number  =  lower_limit ;
		}

		if (number > upper_limit) {

			var  number  =  upper_limit ;
		}

		var  atom  =  sprintf("%b", number) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packSBchunk(integer number)
// //  converts the given 31-bit signed integer number
// //  into an SWF SB atom.

FreeMovieCompiler.prototype.packSBchunk  = function( number )
	{
		array_push(this.FMDebug, "packSBchunk");

		if (!(is_numeric(number))) {

			this.FMError("packSBchunk argument not a number");
		}

		var  number  =  /*(int)*/ number ;

		var  lower_limit  =  -1073741823 ;
		var  upper_limit  =  1073741823 ;

		if (number < lower_limit) {

			number  =  lower_limit ;
		}

		if (number > upper_limit) {

			number  =  upper_limit ;
		}

		if (number < 0) {

			if (number == -1) {

				var  atom  =  "11" ;

			} else {

				atom  =  decbin(number) ;
				atom  =  substr(atom, strpos(atom, "10")) ;
			}

		} else {

			var  atom  =  "0" + decbin(number) ;
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packFBchunk(float number)
// //  converts the given signed floating-point number
// //  into an SWF FB atom.

FreeMovieCompiler.prototype.packFBchunk  = function( number )
	{
		array_push(this.FMDebug, "packFBchunk");

		var  lower_limit_high_word  =  -16383 ;
		var  upper_limit_high_word  =  16383 ;
		var  lower_limit_low_word  =  0 ;
		var  upper_limit_low_word  =  9999 ;

	        if (!(is_numeric(number))) {

        	        this.FMError("packFBchunk argument not a number");
        	}

		var  number  =  Math.round(number, 4) ;

		var  high_word  =  parseInt(number) ;
		var  low_word  =  /*(int)*/ ((Math.abs(number) - parseInt(Math.abs(number))) * 10000) ;

		if (high_word < lower_limit_high_word) {

			high_word  =  lower_limit_high_word ;
		}

		if (high_word > upper_limit_high_word) {

			high_word  =  upper_limit_high_word ;
		}

		if (low_word < lower_limit_low_word) {

			low_word  =  lower_limit_low_word ;
		}

		if (low_word > upper_limit_low_word) {

			low_word  =  upper_limit_low_word ;
		}

		if (number < 0) {

			if (high_word == 0) {

				high_word  =  "1" ;

			} else {

				high_word  =  "1" + substr(decbin(high_word), 18) ;
			}

		} else {

			if (high_word == 0) {

				high_word  =  "0" ;

			} else {

				high_word  =  "0" + decbin(high_word) ;
			}
		}

		if (number < 0) {

			if (low_word == 0) {

				low_word  =  "0000000000000000" ;

			} else {

				low_word  =  ~low_word ;

				low_word  =  substr(decbin(parseInt(low_word * 65536 / 10000)), 16) ;

			}

		} else {

			if (low_word == 0) {

				low_word  =  "0000000000000000" ;

			} else {

				low_word  =  sprintf("%016s", decbin(parseInt(low_word * 65536 / 10000))) ;

			}

		}

		var  atom  =  high_word + low_word ;

		array_pop(this.FMDebug);

		return atom;
	}

// //-------------------------------------------------------
// //  string packnBits(integer number, integer n)
// //  converts the given unsigned integer number (the
// //  length of the largest bit field) into an SWF n bits
// //  long nBits atom.

FreeMovieCompiler.prototype.packnBits  = function( number, n )
	{
		array_push(this.FMDebug, "packnBits");

	        if (!(is_numeric(number))) {
// #error_log("nBits number: $number");
        	        this.FMError("packnBits argument (number) not a number");
        	}

		var  number  =  /*(int)*/ number ;

		var  lower_limit  =  0 ;
		var  upper_limit  =  32 ;

	        if ((number < lower_limit) || (number > upper_limit)) {

        	        this.FMError("packnBits argument (number) out of range");
        	}

	        if (!(is_numeric(n))) {

        	        this.FMError("packnBits argument (n) not a number");
        	}

	        if (n < lower_limit) {

        	        this.FMError("packnBits argument (n) out of range");
        	}

		var  n  =  /*(int)*/ n ;

		if (number > (Math.pow(2, n) - 1)) {

			this.FMError("packnBits cannot pack (number) in (n) bits");
		}

		var  atom  =  sprintf("%b", number) ;
		atom  =  str_repeat("0", (n - strlen(atom))) + atom ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packBitValues(string atoms)
// //  converts the given string of SWF bit values
// //  (atoms) into a byte-aligned stream.

FreeMovieCompiler.prototype.packBitValues  = function( atoms )
	{
		array_push(this.FMDebug, "packBitsValues");

		if (!(is_string(atoms))) {

			this.FMError("packBitValues argument not a string");
		}

		var  atoms  =  atoms + str_repeat("0", /*(int)*/ ((Math.ceil(strlen(atoms) / 8)) * 8 - strlen(atoms))) ;

		var  limit  =  Math.ceil(strlen(atoms) / 8) ;

		var  bytestream  =  "" ;

		for (n = 0; n < limit; n++) {  //FORARG

			bytestream += String.fromCharCode(base_convert(substr(atoms, 0, 8), 2, 10)) ;
			atoms  =  substr(atoms, 8) ;
		}

		array_pop(this.FMDebug);

		return bytestream;
	}

// //--------------------------------------------------
// //  string packSTRING(string text)
// //  converts the given text string into an SWF
// //  STRING atom.

FreeMovieCompiler.prototype.packSTRING  = function( text )
	{
		array_push(this.FMDebug, "packSTRING");

		if (!(is_string(text))) {

			this.FMError("packSTRING argument not a string");
		}

		var  atom  =  strtr(text, String.fromCharCode(0), "") + String.fromCharCode(0) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packRECT(integer Xmin, integer Xmax,
// //                       integer Ymin, integer Ymax)
// //  returns an SWF RECT bit value (atom) string.

FreeMovieCompiler.prototype.packRECT  = function( Xmin, Xmax, Ymin, Ymax )
	{
		array_push(this.FMDebug, "packRECT");

		if (!((Xmin == 0) && (Xmax == 0) && (Ymin == 0) && (Ymax == 0))) {
			var  Xmin  =  this.packSBchunk(Xmin) ;
			var  Xmax  =  this.packSBchunk(Xmax) ;
			var  Ymin  =  this.packSBchunk(Ymin) ;
			var  Ymax  =  this.packSBchunk(Ymax) ;

			var  nBits  =  /*(int)*/ Math.max(strlen(Xmin), strlen(Xmax), strlen(Ymin), strlen(Ymax)) ;

			Xmin  =  str_repeat(substr(Xmin, 0, 1), nBits - strlen(Xmin)) + Xmin ;
			Xmax  =  str_repeat(substr(Xmax, 0, 1), nBits - strlen(Xmax)) + Xmax ;
			Ymin  =  str_repeat(substr(Ymin, 0, 1), nBits - strlen(Ymin)) + Ymin ;
			Ymax  =  str_repeat(substr(Ymax, 0, 1), nBits - strlen(Ymax)) + Ymax ;

			var  atom  =  this.packnBits(nBits, 5) + Xmin + Xmax + Ymin + Ymax ;
		} else {

			atom  =  "00000" ;
		}

		var  atom  =  this.packBitValues(atom) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packRGB(integer R, integer G, integer B)
// //  returns an SWF RGB atom string.

FreeMovieCompiler.prototype.packRGB  = function( R, G, B )
	{
		array_push(this.FMDebug, "packRGB");

		var  atom   =  this.packUI8(R) ;
		atom += this.packUI8(G) ;
		atom += this.packUI8(B) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packRGBA(integer R, integer G,
// //                             integer B, integer A)
// //  returns an SWF RGBA atom string.

FreeMovieCompiler.prototype.packRGBA  = function( R, G, B, A )
	{
		array_push(this.FMDebug, "packRGBA");

		var  atom   =  this.packUI8(R) ;
		atom += this.packUI8(G) ;
		atom += this.packUI8(B) ;
		atom += this.packUI8(A) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packMATRIX(boolean HasScale,
// //    float ScaleX, float ScaleY,boolean HasRotate,
// //            float RotateSkew0, float RotateSkew1,
// //           integer TranslateX, integer TranslateY)
// //  returns an SWF MATRIX atom string.

FreeMovieCompiler.prototype.packMATRIX  = function( HasScale, ScaleX, ScaleY, HasRotate, RotateSkew0, RotateSkew1, TranslateX, TranslateY )
	{
		array_push(this.FMDebug, "packMATRIX");

		var  atom  =  "" ;

		if (HasScale) {

			var  ScaleX  =  this.packFBchunk(ScaleX) ;
			var  ScaleY  =  this.packFBchunk(ScaleY) ;

			var  nScaleBits  =  /*(int)*/ Math.max(strlen(ScaleX), strlen(ScaleY)) ;
// #$nScaleBits = 31;

			ScaleX  =  str_repeat(substr(ScaleX, 0, 1), (nScaleBits - strlen(ScaleX))) + ScaleX ;
			ScaleY  =  str_repeat(substr(ScaleY, 0, 1), (nScaleBits - strlen(ScaleY))) + ScaleY ;

			atom  =  "1" + this.packnBits(nScaleBits, 5) + ScaleX + ScaleY ;
		} else {

			atom  =  "0" ;
		}

		if (HasRotate) {

			var  RotateSkew0  =  this.packFBchunk(RotateSkew0) ;
			var  RotateSkew1  =  this.packFBchunk(RotateSkew1) ;

// #$nRotateBits = 31;
			var  nRotateBits  =  /*(int)*/ Math.max(strlen(RotateSkew0), strlen(RotateSkew1)) ;

			RotateSkew0  =  str_repeat(substr(RotateSkew0, 0, 1), nRotateBits - strlen(RotateSkew0)) + RotateSkew0 ;
			RotateSkew1  =  str_repeat(substr(RotateSkew1, 0, 1), nRotateBits - strlen(RotateSkew1)) + RotateSkew1 ;

			atom += "1" + this.packnBits(nRotateBits, 5) + RotateSkew0 + RotateSkew1 ;

		} else {

			atom += "0" ;
		}

		if ((TranslateX == 0) && (TranslateY == 0)) {

			atom += "00000" ;

		} else {

			var  TranslateX  =  this.packSBchunk(TranslateX) ;
			var  TranslateY  =  this.packSBchunk(TranslateY) ;

			var  nTranslateBits  =  /*(int)*/ Math.max(strlen(TranslateX), strlen(TranslateY)) ;

			TranslateX  =  str_repeat(substr(TranslateX, 0, 1), nTranslateBits - strlen(TranslateX)) + TranslateX ;
			TranslateY  =  str_repeat(substr(TranslateY, 0, 1), nTranslateBits - strlen(TranslateY)) + TranslateY ;

			atom += this.packnBits(nTranslateBits, 5) + TranslateX + TranslateY ;
		}

		var  atom   =  this.packBitValues(atom) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packCXFORM(boolean HasAddTerms,
// //        integer RedAddTerm, integer GreenAddTerm,
// //       integer BlueAddTerm, boolean HasMultTerms,
// //      integer RedMultTerm, integer GreenMultTerm,
// //                             integer BlueMultTerm)
// //  returns an SWF CXFORM atom string.

FreeMovieCompiler.prototype.packCXFORM  = function( HasAddTerms, RedAddTerm, GreenAddTerm, BlueAddTerm, HasMultTerms, RedMultTerm, GreenMultTerm, BlueMultTerm )
	{
		array_push(this.FMDebug, "packCXFORM");

		if (HasAddTerms) {

			var  RedAddTerm  =  this.packSBchunk(RedAddTerm) ;
			var  GreenAddTerm  =  this.packSBchunk(GreenAddTerm) ;
			var  BlueAddTerm  =  this.packSBchunk(BlueAddTerm) ;

			var  atom  =  "1" ;

		} else {

			atom  =  "0" ;
		}

		if (HasMultTerms) {

			var  RedMultTerm  =  this.packSBchunk(RedMultTerm) ;
			var  GreenMultTerm  =  this.packSBchunk(GreenMultTerm) ;
			var  BlueMultTerm  =  this.packSBchunk(BlueMultTerm) ;

			atom += "1" ;

		} else {

			atom += "0" ;
		}

		if (!((HasAddTerms == 0) && (HasMultTerms == 0))) {

			var  nBits  =  /*(int)*/ Math.max(strlen(RedMultTerm), strlen(GreenMultTerm), strlen(BlueMultTerm), strlen(RedAddTerm), strlen(GreenAddTerm), strlen(BlueAddTerm)) ;

			var  RedAddTerm  =  str_repeat(substr(RedAddTerm, 0, 1), nBits - strlen(RedAddTerm)) + RedAddTerm ;
			var  GreenAddTerm  =  str_repeat(substr(GreenAddTerm, 0, 1), nBits - strlen(GreenAddTerm)) + GreenAddTerm ;
			var  BlueAddTerm  =  str_repeat(substr(BlueAddTerm, 0, 1), nBits - strlen(BlueAddTerm)) + BlueAddTerm ;

			var  RedMultTerm  =  str_repeat(substr(RedMultTerm, 0, 1), nBits - strlen(RedMultTerm)) + RedMultTerm ;
			var  GreenMultTerm  =  str_repeat(substr(GreenMultTerm, 0, 1), nBits - strlen(GreenMultTerm)) + GreenMultTerm ;
			var  BlueMultTerm  =  str_repeat(substr(BlueMultTerm, 0, 1), nBits - strlen(BlueMultTerm)) + BlueMultTerm ;

			atom += this.packnBits(nBits, 5) ;

			if (HasMultTerms) {

				atom += RedMultTerm + GreenMultTerm + BlueMultTerm ;
			}

			if (HasAddTerms) {

				atom += RedAddTerm + GreenAddTerm + BlueAddTerm ;
			}

		}

		var  atom  =  this.packBitValues(atom) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packCXFORMWITHALPHA(boolean HasAddTerms,
// //        integer RedAddTerm, integer GreenAddTerm,
// //       integer BlueAddTerm, integer AlphaAddTerm,
// //       boolean HasMultTerms, integer RedMultTerm,
// //     integer GreenMultTerm, integer BlueMultTerm,
// //                            integer AlphaMultTerm)
// //  returns an SWF CXFORMWITHALPHA atom string.

FreeMovieCompiler.prototype.packCXFORMWITHALPHA  = function( HasAddTerms, RedAddTerm, GreenAddTerm, BlueAddTerm, AlphaAddTerm, HasMultTerms, RedMultTerm, GreenMultTerm, BlueMultTerm, AlphaMultTerm )
	{
		array_push(this.FMDebug, "packCXFORMWITHALPHA");

		if (HasAddTerms) {

			var  RedAddTerm  =  this.packSBchunk(RedAddTerm) ;
			var  GreenAddTerm  =  this.packSBchunk(GreenAddTerm) ;
			var  BlueAddTerm  =  this.packSBchunk(BlueAddTerm) ;
			var  AlphaAddTerm  =  this.packSBchunk(AlphaAddTerm) ;

			var  atom  =  "1" ;

		} else {

			atom  =  "0" ;
		}

		if (HasMultTerms) {

			var  RedMultTerm  =  this.packSBchunk(RedMultTerm) ;
			var  GreenMultTerm  =  this.packSBchunk(GreenMultTerm) ;
			var  BlueMultTerm  =  this.packSBchunk(BlueMultTerm) ;
			var  AlphaMultTerm  =  this.packSBchunk(AlphaMultTerm) ;

			atom += "1" ;

		} else {

			atom += "0" ;
		}

		if (!((HasAddTerms == 0) && (HasMultTerms == 0))) {

			var  nBits  =  /*(int)*/ Math.max(strlen(RedMultTerm), strlen(GreenMultTerm), strlen(BlueMultTerm), strlen(AlphaMultTerm), strlen(RedAddTerm), strlen(GreenAddTerm), strlen(BlueAddTerm), strlen(AlphaAddTerm)) ;

			var  RedAddTerm  =  str_repeat(substr(RedAddTerm, 0, 1), nBits - strlen(RedAddTerm)) + RedAddTerm ;
			var  GreenAddTerm  =  str_repeat(substr(GreenAddTerm, 0, 1), nBits - strlen(GreenAddTerm)) + GreenAddTerm ;
			var  BlueAddTerm  =  str_repeat(substr(BlueAddTerm, 0, 1), nBits - strlen(BlueAddTerm)) + BlueAddTerm ;
			var  AlphaAddTerm  =  str_repeat(substr(AlphaAddTerm, 0, 1), nBits - strlen(AlphaAddTerm)) + AlphaAddTerm ;

			var  RedMultTerm  =  str_repeat(substr(RedMultTerm, 0, 1), nBits - strlen(RedMultTerm)) + RedMultTerm ;
			var  GreenMultTerm  =  str_repeat(substr(GreenMultTerm, 0, 1), nBits - strlen(GreenMultTerm)) + GreenMultTerm ;
			var  BlueMultTerm  =  str_repeat(substr(BlueMultTerm, 0, 1), nBits - strlen(BlueMultTerm)) + BlueMultTerm ;
			var  AlphaMultTerm  =  str_repeat(substr(AlphaMultTerm, 0, 1), nBits - strlen(AlphaMultTerm)) + AlphaMultTerm ;

			atom += this.packnBits(nBits, 5) ;

			if (HasMultTerms == "1") {
				atom += RedMultTerm + GreenMultTerm + BlueMultTerm + AlphaMultTerm ;
			}

			if (HasAddTerms == "1") {
				atom += RedAddTerm + GreenAddTerm + BlueAddTerm + AlphaAddTerm ;
			}

		}

		var  atom  =  this.packBitValues(atom) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //------------------------------------------------//
// //                                                //
// //              Compound data types               //
// //                                                //
// //------------------------------------------------//

// //--------------------------------------------------
// //  string packZLIBBITMAPDATA(string ColorTableRGB,
// //                           string BitmapPixelData)
// //  returns an SWF ZLIBBITMAPDATA string.

FreeMovieCompiler.prototype.packZLIBBITMAPDATA  = function( ColorTableRGB, BitmapPixelData )
	{
		array_push(this.FMDebug, "packZLIBBITMAPDATA");

		var  atom  =  ColorTableRGB + BitmapPixelData ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packZLIBBITMAPDATA2(
// //    string ColorTableRGBA, string BitmapPixelData)
// //  returns an SWF ZLIBBITMAPDATA2 string.

FreeMovieCompiler.prototype.packZLIBBITMAPDATA2  = function( ColorTableRGBA, BitmapPixelData )
	{
		array_push(this.FMDebug, "packZLIBBITMAPDATA2");

		var  atom  =  ColorTableRGBA + BitmapPixelData ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packGRADRECORD(string ShapeTag,
// //             integer Ratio, integer R, integer G,
// //                             integer B, boolean AlphaFlag, integer A)
// //  returns an SWF GRADRECORD string.

FreeMovieCompiler.prototype.packGRADRECORD  = function( Ratio, R, G, B, AlphaFlag, A )
	{
		array_push(this.FMDebug, "packGRADRECORD");

		if (AlphaFlag) {
			var  atom  =  this.packUI8(/*(int)*/Ratio) + this.packRGBA(/*(int)*/R, /*(int)*/G, /*(int)*/B, /*(int)*/A) ;
		} else {
			atom  =  this.packUI8(/*(int)*/Ratio) + this.packRGB(/*(int)*/R, /*(int)*/G, /*(int)*/B) ;
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packGRADIENT(string GradientRecords)
// //  returns an SWF GRADIENT string.

FreeMovieCompiler.prototype.packGRADIENT  = function( GradientRecords, AlphaFlag )
	{
		array_push(this.FMDebug, "packGRADIENT");

		if (AlphaFlag) {
			var  atom  =  this.packUI8(/*(int)*/strlen(GradientRecords) / 5) + GradientRecords ;
		} else {
			var  atom   =  this.packUI8(/*(int)*/strlen(GradientRecords) / 4) + GradientRecords ;
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packFILLSTYLE(int FillStyleType, int R,
// //      int G, int B, int A, string GradientMatrix,
// //               string Gradient, integer BitmapID,
// //                              string BitmapMatrix)
// //  returns an SWF FILLSTYLE string.

FreeMovieCompiler.prototype.packFILLSTYLE  = function( FillStyleType, R, G, B, AlphaFlag, A, GradientMatrix, Gradient, BitmapID, BitmapMatrix )
	{
		array_push(this.FMDebug, "packFILLSTYLE");

// //-------------------------------------------------- .[cal]
// //  add vertical and horizontal straight edges.
		if(!isset(atom) & this.Cal_mode){
				var  atom  =  "" ;
		}
// // [cal].


		switch (FillStyleType) {

			case 0x00:

				if (AlphaFlag) {

					if (A == "") {

						var  A  =  0xff ;
					}

					atom += this.packRGBA(R, G, B, A) ;

				} else {

					atom += this.packRGB(R, G, B) ;
				}

				break;

			case 0x10:

				atom += GradientMatrix + Gradient ;

				break;

			case 0x12:

				atom += GradientMatrix + Gradient ;

				break;

			case 0x40:

				atom += this.packUI16(BitmapID) + BitmapMatrix ;

				break;

			case 0x41:

				atom += this.packUI16(BitmapID) + BitmapMatrix ;

				break;

			default:

				this.FMError("packFILLSTYLE unknown FillStyleType value");
		}

		var  atom   =  this.packUI8(FillStyleType) + atom ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packFILLSTYLEARRAY(string ShapeTag,
// //       integer FillStyleCount, string FillStyles)
// //  returns an SWF FILLSTYLEARRAY string.

FreeMovieCompiler.prototype.packFILLSTYLEARRAY  = function( FillStyleCount, FillStyles )
	{
		array_push(this.FMDebug, "packFILLSTYLEARRAY");

		if (FillStyleCount < 0xff) {

			var  atom  =  this.packUI8(FillStyleCount) ;

		} else {

			atom  =  String.fromCharCode(0xff) + this.packUI16(FillStyleCount) ;
		}

		atom += FillStyles ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packLINESTYLE(integer Width, integer R,
// //                  integer G, integer B, integer A)
// //  returns an SWF LINESTYLE string.

FreeMovieCompiler.prototype.packLINESTYLE  = function( Width, R, G, B, AlphaFlag, A )
	{
		array_push(this.FMDebug, "packLINESTYLE");

		var  atom   =  this.packUI16(Width) ;

		if (AlphaFlag) {

			if (A == "") {

				var  A  =  0xff ;
			}

			atom  += this.packRGBA(R, G, B, A) ;

		} else {

			atom  += this.packRGB(R, G, B) ;
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packLINESTYLEARRAY(int LineStyleCount,
// //                                string LineStyles)
// //  returns an SWF LINESTYLEARRAY string.

FreeMovieCompiler.prototype.packLINESTYLEARRAY  = function( LineStyleCount, LineStyles )
	{
		array_push(this.FMDebug, "packLINESTYLEARRAY");

		if (LineStyleCount < 0xff) {

			var  atom   =  this.packUI8(LineStyleCount) ;

		} else {

			atom += String.fromCharCode(0xff) + this.packUI16(LineStyleCount) ;
		}

		atom += LineStyles ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packCURVEDEDGERECORD(
// //    integer ControlDeltaX, integer ControlDeltaY,
// //       integer AnchorDeltaX, integer AnchorDeltaY)
// //  returns an SWF CURVEDEDGERECORD string.

FreeMovieCompiler.prototype.packCURVEDEDGERECORD  = function( ControlDeltaX, ControlDeltaY, AnchorDeltaX, AnchorDeltaY )
	{
		array_push(this.FMDebug, "packCURVEDEDGERECORD");

		var  TypeFlag  =  "1" ;
		var  StraightEdge  =  "0" ;

		var  ControlDeltaX  =  this.packSBchunk(ControlDeltaX) ;
		var  ControlDeltaY  =  this.packSBchunk(ControlDeltaY) ;
		var  AnchorDeltaX  =  this.packSBchunk(AnchorDeltaX) ;
		var  AnchorDeltaY  =  this.packSBchunk(AnchorDeltaY) ;

		var  NumBits  =  /*(int)*/ Math.max(strlen(ControlDeltaX), strlen(ControlDeltaY), strlen(AnchorDeltaX), strlen(AnchorDeltaY)) ;

		var  nBits  =  this.packnBits(NumBits - 2, 4) ;

		ControlDeltaX  =  str_repeat(substr(ControlDeltaX, 0, 1), (NumBits - strlen(ControlDeltaX))) + ControlDeltaX ;
		ControlDeltaY  =  str_repeat(substr(ControlDeltaY, 0, 1), (NumBits - strlen(ControlDeltaY))) + ControlDeltaY ;

		AnchorDeltaX  =  str_repeat(substr(AnchorDeltaX, 0, 1), (NumBits - strlen(AnchorDeltaX))) + AnchorDeltaX ;
		AnchorDeltaY  =  str_repeat(substr(AnchorDeltaY, 0, 1), (NumBits - strlen(AnchorDeltaY))) + AnchorDeltaY ;

		var  atom  =  TypeFlag + StraightEdge + nBits + ControlDeltaX + ControlDeltaY + AnchorDeltaX + AnchorDeltaY ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packSTRAIGHTEDGERECORD(
// //   boolean GeneralLineFlag, boolean VertLineFlag,
// //                   integer DeltaX, integer DeltaY)
// //  returns an SWF STRAIGHTEDGERECORD string.

FreeMovieCompiler.prototype.packSTRAIGHTEDGERECORD  = function( GeneralLineFlag, VertLineFlag, DeltaX, DeltaY )
	{
		array_push(this.FMDebug, "packSTRAIGHTEDGERECORD");

		var  TypeFlag  =  "1" ;
		var  StraightEdge  =  "1" ;

		if ((DeltaX == 0) && (DeltaY == 0)) {

			var  atom  =  sprintf("%1d", TypeFlag) + sprintf("%1d", StraightEdge) + "0"  ;

		} else {

			var  DeltaX  =  this.packSBchunk(DeltaX) ;
			var  DeltaY  =  this.packSBchunk(DeltaY) ;

			var  NumBits  =  /*(int)*/ Math.max(strlen(DeltaX), strlen(DeltaY)) ;

			var  nBits  =  this.packnBits((NumBits - 2), 4) ;

			DeltaX  =  str_repeat(substr(DeltaX, 0, 1), (NumBits - strlen(DeltaX))) + DeltaX ;
			DeltaY  =  str_repeat(substr(DeltaY, 0, 1), (NumBits - strlen(DeltaY))) + DeltaY ;

			atom  =  sprintf("%1d", TypeFlag) + sprintf("%1d", StraightEdge) + nBits + sprintf("%1d", GeneralLineFlag) ;

			if (GeneralLineFlag) {

				atom += DeltaX + DeltaY ;

			} else {

				if (VertLineFlag) {

					atom += sprintf("%1d", VertLineFlag) + DeltaY ;
				} else {

					atom += sprintf("%1d", VertLineFlag) + DeltaX ;
				}
			}
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packSTYLECHANGERECORD(
// //                          integer StateNewStyles,
// //                          integer StateLineStyle,
// //                         integer StateFillStyle1,
// //    integer StateFillStyle0, integer StateMoveTo,
// //          integer MoveDeltaX, integer MoveDeltaY,
// //            integer nFillBits, integer nLineBits,
// //          integer FillStyle0, integer FillStyle1,
// //            integer LineStyle, string FillStyles,
// //          string LineStyles, integer NumFillBits,
// //                              integer NumLineBits)
// //  returns an SWF STYLECHANGERECORD string.

FreeMovieCompiler.prototype.packSTYLECHANGERECORD  = function( StateNewStyles, StateLineStyle, StateFillStyle1, StateFillStyle0, StateMoveTo, MoveDeltaX, MoveDeltaY, nFillBits, nLineBits, FillStyle0, FillStyle1, LineStyle, FillStyles, LineStyles, NumFillBits, NumLineBits )
	{
// #error_log("statennewstyles: $StateNewStyles, statelinestyle: $StateLineStyle, statefillstyle1: $StateFillStyle1, statefillstyle0: $StateFillStyle0, statemoveto: $StateMoveTo, movedeltaX: $MoveDeltaX, movedeltay: $MoveDeltaY, nfillbits: $nFillBits, nlinebits: $nLineBits, fillstyle0: $FillStyle0, fillstyle1: $FillStyle1, linestyle: $LineStyle, fillstyles: $FillStyles, linestyles: $LineStyles, numfillbits: $NumFillBits, numlinebits: $NumLineBits");
// #error_log("nFillBits: $nFillBits");
// #error_log("nLineBits: $nLineBits");
		array_push(this.FMDebug, "packSTYLECHANGERECORD");

		var  atom  =  {"Bitstream" : "", "Bytestream" : ""}; ;
		atom["Bitstream"] += "0" ;

		atom["Bitstream"] += sprintf("%1d", StateNewStyles) ;
		atom["Bitstream"] += sprintf("%1d", StateLineStyle) ;
		atom["Bitstream"] += sprintf("%1d", StateFillStyle1) ;
		atom["Bitstream"] += sprintf("%1d", StateFillStyle0) ;
		atom["Bitstream"] += sprintf("%1d", StateMoveTo) ;

		if (StateMoveTo == 1) {

			var  MoveDeltaX  =  this.packSBchunk(MoveDeltaX) ;
			var  MoveDeltaY  =  this.packSBchunk(MoveDeltaY) ;

			var  MoveBits  =  /*(int)*/ Math.max(strlen(MoveDeltaX), strlen(MoveDeltaY)) ;
			var  nMoveBits  =  this.packnBits(MoveBits, 5) ;

			MoveDeltaX  =  str_repeat(substr(MoveDeltaX, 0, 1), (MoveBits - strlen(MoveDeltaX))) + MoveDeltaX ;
			MoveDeltaY  =  str_repeat(substr(MoveDeltaY, 0, 1), (MoveBits - strlen(MoveDeltaY))) + MoveDeltaY ;

			atom["Bitstream"] += nMoveBits + MoveDeltaX + MoveDeltaY ;
		}

		if (StateFillStyle0) {

			atom["Bitstream"] += this.packnBits(FillStyle0, nFillBits) ;
		}

		if (StateFillStyle1) {

			atom["Bitstream"] += this.packnBits(FillStyle1, nFillBits) ;
		}

		if (StateLineStyle) {

			atom["Bitstream"] += this.packnBits(LineStyle, nLineBits) ;
// #error_log($this->packnBits($LineStyle, $nLineBits));
// #error_log("here?");
		}

		if (StateNewStyles) {

			atom["Bytestream"]  =  FillStyles + LineStyles + this.packUI8(/*(int)*/(this.packnBits(NumFillBits, 4) + this.packnBits(NumLineBits, 4))) ;
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packENDSHAPERECORD()
// //  returns an SWF ENDSHAPERECORD string.

FreeMovieCompiler.prototype.packENDSHAPERECORD  = function(  )
	{
		array_push(this.FMDebug, "packENDSHAPERECORD");

		var  TypeFlag  =  "0" ;
		var  EndOfShape  =  "00000" ;

		var  atom  =  TypeFlag + EndOfShape ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packSHAPEWITHSTYLE(string FillStyles,
// //          string LineStyles, integer NumFillBits,
// //         integer NumLineBits, string ShapeRecords)
// //  returns an SWF SHAPEWITHSTYLE string.

FreeMovieCompiler.prototype.packSHAPEWITHSTYLE  = function( FillStyles, LineStyles, NumFillBits, NumLineBits, ShapeRecords )
	{
		array_push(this.FMDebug, "packSHAPEWITHSTYLE");

		var  lower_limit  =  0 ;
		var  upper_limit  =  15 ;

		if ((NumFillBits < lower_limit) || (NumFillBits > upper_limit)) {
			this.FMError("packSHAPEWITHSTYLE argument (NumFillBits) out of range");
		}

		if ((NumLineBits < lower_limit) || (NumLineBits > upper_limit)) {
			this.FMError("packSHAPEWITHSTYLE argument (NumLineBits) out of range");
		}

		var  atom   =  FillStyles ;
		atom += LineStyles ;

		var  NumFillBits  =  this.packnBits(NumFillBits, 4) ;
		var  NumLineBits  =  this.packnBits(NumLineBits, 4) ;

		atom += this.packBitValues(NumFillBits + NumLineBits) ;
		atom += ShapeRecords ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packSHAPE(integer NumFillBits,
// //         integer NumLineBits, string ShapeRecords)
// //  returns an SWF SHAPE string.

FreeMovieCompiler.prototype.packSHAPE  = function( NumFillBits, NumLineBits, ShapeRecords )
	{
		array_push(this.FMDebug, "packSHAPE");

		var  lower_limit  =  0 ;
		var  upper_limit  =  15 ;

		if ((NumFillBits < lower_limit) || (NumFillBits > upper_limit)) {
			this.FMError("packSHAPE argument (NumFillBits) out of range");
		}

		if ((NumLineBits < lower_limit) || (NumLineBits > upper_limit)) {
			this.FMError("packSHAPE argument (NumLineBits) out of range");
		}

		var  atom   =  this.packnBits(NumFillBits, 4) ;
		atom += this.packnBits(NumLineBits, 4) ;

		atom   =  this.packBitValues(atom) ;
		atom += ShapeRecords ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packASSET(integer Tag, string Label)
// //  returns an ASSET string used by ExportAssets
// //  and ImportAssets tags.

FreeMovieCompiler.prototype.packASSET  = function( Tag, Label )
	{
		array_push(this.FMDebug, "packASSET");

		var  atom   =  this.packUI16(Tag) ;
		atom += this.packSTRING(Label) ;

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  array parseJPEGfile(string filename)
// //  returns an array that holds the given JPEG file
// //  broken up into chunks.

FreeMovieCompiler.prototype.parseJPEGfile  = function( filename )
	{
		array_push(this.FMDebug, "parseJPEGfile");

		var  SOI   =  String.fromCharCode(0xff) + String.fromCharCode(0xd8) ;
		var  APP0  =  String.fromCharCode(0xff) + String.fromCharCode(0xe0) ;
		var  DQT   =  String.fromCharCode(0xff) + String.fromCharCode(0xdb) ;
		var  SOF0  =  String.fromCharCode(0xff) + String.fromCharCode(0xc0) ;
		var  SOF1  =  String.fromCharCode(0xff) + String.fromCharCode(0xc1) ;
		var  SOF2  =  String.fromCharCode(0xff) + String.fromCharCode(0xc2) ;
		var  DHT   =  String.fromCharCode(0xff) + String.fromCharCode(0xc4) ;
		var  DRI   =  String.fromCharCode(0xff) + String.fromCharCode(0xdd) ;
		var  SOS   =  String.fromCharCode(0xff) + String.fromCharCode(0xda) ;
		var  EOI   =  String.fromCharCode(0xff) + String.fromCharCode(0xd9) ;
		var  COM   =  String.fromCharCode(0xff) + String.fromCharCode(0xfe) ;

		var  filearray  =  {"JPEGEncoding" : "", "JPEGImage" : ""}; ;

		var  filehandle  =  fopen(filename, "r") ;

		if (filehandle == FALSE) {
			this.FMError("parseJPEGfile cannot open file");
		}

		var  jpeg  =  fread(filehandle, filesize(filename)) ;

		fclose(filehandle);

		var  marker  =  strpos(jpeg, SOI) ;

		jpeg  =  substr(jpeg, marker) ;

		var  loop  =  True ;

		while (loop == True) {

			if (strlen(jpeg) == 0) {
				loop  =  False ;
			}

			switch (substr(jpeg, 0, 2)) {

				case SOI:

					filearray["JPEGEncoding"]  =  SOI ;
					filearray["JPEGImage"]  =  SOI ;
					jpeg  =  substr(jpeg, 2) ;
					break;

				case APP0:

					var  blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
					filearray["JPEGImage"] += substr(jpeg, 0, blocklength + 2) ;
					jpeg  =  substr(jpeg, blocklength + 2) ;
					break;

				case DQT:

					blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
					filearray["JPEGEncoding"] += substr(jpeg, 0, blocklength + 2) ;
					jpeg  =  substr(jpeg, blocklength + 2) ;
					break;

				case SOF0:
				case SOF1:
				case SOF2:

					blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
					filearray["JPEGImage"] += substr(jpeg, 0, blocklength + 2) ;
					filearray["width"]  =  ord(substr(jpeg, 7, 1)) * 256 + ord(substr(jpeg, 8, 1)) ;
					filearray["height"]  =  ord(substr(jpeg, 5, 1)) * 256 + ord(substr(jpeg, 6, 1)) ;
					jpeg  =  substr(jpeg, blocklength + 2) ;
					break;

				case DHT:

					blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
					filearray["JPEGEncoding"] += substr(jpeg, 0, blocklength + 2) ;
					jpeg  =  substr(jpeg, blocklength + 2) ;
					break;

				case DRI:

					blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
					filearray["JPEGImage"] += substr(jpeg, 0, blocklength + 2) ;
					jpeg  =  substr(jpeg, blocklength + 2) ;
					break;

				case COM:

					blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
					jpeg  =  substr(jpeg, blocklength + 2) ;
					break;
				case EOI:

					filearray["JPEGEncoding"] += EOI ;
					filearray["JPEGImage"] += EOI ;
					loop  =  False ;
					break;

				default:

					if (substr(jpeg, 0, 2) == SOS) {

						blocklength  =  ord(substr(jpeg, 2, 1)) * 256 + ord(substr(jpeg, 3, 1)) ;
						filearray["JPEGImage"] += substr(jpeg, 0, blocklength + 2) ;
						jpeg  =  substr(jpeg, blocklength + 2) ;
						marker  =  strpos(jpeg, String.fromCharCode(255)) ;
						filearray["JPEGImage"] += substr(jpeg, 0, marker) ;
						jpeg  =  substr(jpeg, marker) ;
						var  foundsos  =  True ;

					} else {

						if (foundsos) {

							filearray["JPEGImage"] += substr(jpeg, 0, 1) ;
							jpeg  =  substr(jpeg, 1) ;
							marker  =  strpos(jpeg, String.fromCharCode(255)) ;
							filearray["JPEGImage"] += substr(jpeg, 0, marker) ;
							jpeg  =  substr(jpeg, marker) ;
						} else {

							this.FMError("parseJPEGfile error parsing JPEG file file");
						}
					}
			}

		};

		array_pop(this.FMDebug);

		return filearray;
	}

// //--------------------------------------------------
// //  array parseTIFFfile(string filename,
// //                               array AlphaPalette)
// //  returns an array that holds the given JPEG file
// //  broken up into chunks.

FreeMovieCompiler.prototype.parseTIFFfile  = function( filename, AlphaPalette )
	{
		array_push(this.FMDebug, "parseTIFFfile");

		var  II  =  String.fromCharCode(0x49) + String.fromCharCode(0x49) ;
		var  MM  =  String.fromCharCode(0x4d) + String.fromCharCode(0x4d) ;

		var  TIFFNewSubfileType  =  {"II" : String.fromCharCode(0xfe) + String.fromCharCode(0x00), "MM" : String.fromCharCode(0x00) + String.fromCharCode(0xfe)}; ;
		var  TIFFSubfileType  =  {"II" : String.fromCharCode(0xff) + String.fromCharCode(0x00), "MM" : String.fromCharCode(0x00) + String.fromCharCode(0xff)}; ;
		var  TIFFImageWidth  =  {"II" : String.fromCharCode(0x00) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x00)}; ;
		var  TIFFImageLength  =  {"II" : String.fromCharCode(0x01) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x01)}; ;
		var  TIFFBitsPerSample  =  {"II" : String.fromCharCode(0x02) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x02)}; ;
		var  TIFFCompression  =  {"II" : String.fromCharCode(0x03) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x03)}; ;
		var  TIFFPhotometricInterpretation  =  {"II" : String.fromCharCode(0x06) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x06)}; ;
		var  TIFFThresholding  =  {"II" : String.fromCharCode(0x07) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x07)}; ;
		var  TIFFCellWidth  =  {"II" : String.fromCharCode(0x08) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x08)}; ;
		var  TIFFCellLength  =  {"II" : String.fromCharCode(0x09) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x09)}; ;
		var  TIFFFillOrder  =  {"II" : String.fromCharCode(0x0a) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x0a)}; ;
		var  TIFFDocumentName  =  {"II" : String.fromCharCode(0x0d) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x0d)}; ;
		var  TIFFImageDescription  =  {"II" : String.fromCharCode(0x0e) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x0e)}; ;
		var  TIFFMake  =  {"II" : String.fromCharCode(0x0f) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x0f)}; ;
		var  TIFFModel  =  {"II" : String.fromCharCode(0x10) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x10)}; ;
		var  TIFFStripOffsets  =  {"II" : String.fromCharCode(0x11) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x11)}; ;
		var  TIFFOrientation  =  {"II" : String.fromCharCode(0x12) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x12)}; ;
		var  TIFFSamplesPerPixel  =  {"II" : String.fromCharCode(0x15) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x15)}; ;
		var  TIFFRowsPerStrip  =  {"II" : String.fromCharCode(0x16) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x16)}; ;
		var  TIFFStripByteCounts  =  {"II" : String.fromCharCode(0x17) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x17)}; ;
		var  TIFFMinSampleValue  =  {"II" : String.fromCharCode(0x18) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x18)}; ;
		var  TIFFMaxSampleValue  =  {"II" : String.fromCharCode(0x19) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x19)}; ;
		var  TIFFXResolution  =  {"II" : String.fromCharCode(0x1a) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x1a)}; ;
		var  TIFFYResolution  =  {"II" : String.fromCharCode(0x1b) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x1b)}; ;
		var  TIFFPlanarConfiguration  =  {"II" : String.fromCharCode(0x1c) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x1c)}; ;
		var  TIFFPageName  =  {"II" : String.fromCharCode(0x1d) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x1d)}; ;
		var  TIFFXPosition  =  {"II" : String.fromCharCode(0x1e) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x1e)}; ;
		var  TIFFYPosition  =  {"II" : String.fromCharCode(0x1f) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x1f)}; ;
		var  TIFFFreeOffsets  =  {"II" : String.fromCharCode(0x20) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x20)}; ;
		var  TIFFFreeByteCounts  =  {"II" : String.fromCharCode(0x21) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x21)}; ;
		var  TIFFGrayResponseUnit  =  {"II" : String.fromCharCode(0x22) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x22)}; ;
		var  TIFFGrayResponseCurve  =  {"II" : String.fromCharCode(0x23) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x23)}; ;
		var  TIFFT4Options  =  {"II" : String.fromCharCode(0x24) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x24)}; ;
		var  TIFFT6Options  =  {"II" : String.fromCharCode(0x25) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x25)}; ;
		var  TIFFResolutionUnit  =  {"II" : String.fromCharCode(0x28) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x28)}; ;
		var  TIFFPageNumber  =  {"II" : String.fromCharCode(0x29) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x29)}; ;
		var  TIFFTransferFunction  =  {"II" : String.fromCharCode(0x2d) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x2d)}; ;
		var  TIFFSoftware  =  {"II" : String.fromCharCode(0x31) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x31)}; ;
		var  TIFFDateTime  =  {"II" : String.fromCharCode(0x32) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x32)}; ;
		var  TIFFArtist  =  {"II" : String.fromCharCode(0x3b) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x3b)}; ;
		var  TIFFHostComputer  =  {"II" : String.fromCharCode(0x3c) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x3c)}; ;
		var  TIFFPredictor  =  {"II" : String.fromCharCode(0x3d) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x3d)}; ;
		var  TIFFWhitePoint  =  {"II" : String.fromCharCode(0x3e) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x3e)}; ;
		var  TIFFPrimaryChromaticities  =  {"II" : String.fromCharCode(0x3f) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x3f)}; ;
		var  TIFFColorMap  =  {"II" : String.fromCharCode(0x40) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x40)}; ;
		var  TIFFHalftoneHints  =  {"II" : String.fromCharCode(0x41) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x41)}; ;
		var  TIFFTileWidth  =  {"II" : String.fromCharCode(0x42) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x42)}; ;
		var  TIFFTileLength  =  {"II" : String.fromCharCode(0x43) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x43)}; ;
		var  TIFFTileOffsets  =  {"II" : String.fromCharCode(0x44) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x44)}; ;
		var  TIFFTileByteCounts  =  {"II" : String.fromCharCode(0x45) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x45)}; ;
		var  TIFFInkSet  =  {"II" : String.fromCharCode(0x4c) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x4c)}; ;
		var  TIFFInkNames  =  {"II" : String.fromCharCode(0x4d) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x4d)}; ;
		var  TIFFNumberOfInks  =  {"II" : String.fromCharCode(0x4e) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x4e)}; ;
		var  TIFFDotRange  =  {"II" : String.fromCharCode(0x50) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x50)}; ;
		var  TIFFTargetPrinter  =  {"II" : String.fromCharCode(0x51) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x51)}; ;
		var  TIFFExtraSamples  =  {"II" : String.fromCharCode(0x52) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x52)}; ;
		var  TIFFSampleFormat  =  {"II" : String.fromCharCode(0x53) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x53)}; ;
		var  TIFFSMinSampleValue  =  {"II" : String.fromCharCode(0x54) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x54)}; ;
		var  TIFFSMaxSampleValue  =  {"II" : String.fromCharCode(0x55) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x55)}; ;
		var  TIFFTransferRange  =  {"II" : String.fromCharCode(0x56) + String.fromCharCode(0x01), "MM" : String.fromCharCode(0x01) + String.fromCharCode(0x56)}; ;
		var  TIFFJPEGProc  =  {"II" : String.fromCharCode(0x00) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x00)}; ;
		var  TIFFJPEGInterchangeFormat  =  {"II" : String.fromCharCode(0x01) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x01)}; ;
		var  TIFFJPEGInterchangeFormatLength  =  {"II" : String.fromCharCode(0x02) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x02)}; ;
		var  TIFFJPEGRestartInterval  =  {"II" : String.fromCharCode(0x03) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x03)}; ;
		var  TIFFJPEGLosslessPredictors  =  {"II" : String.fromCharCode(0x05) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x05)}; ;
		var  TIFFJPEGPointTransforms  =  {"II" : String.fromCharCode(0x06) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x06)}; ;
		var  TIFFJPEGQTables  =  {"II" : String.fromCharCode(0x07) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x07)}; ;
		var  TIFFJPEGDCTables  =  {"II" : String.fromCharCode(0x08) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x08)}; ;
		var  TIFFJPEGACTables  =  {"II" : String.fromCharCode(0x09) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x09)}; ;
		var  TIFFYCbCrCoefficients  =  {"II" : String.fromCharCode(0x11) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x11)}; ;
		var  TIFFYCbCrSubSampling  =  {"II" : String.fromCharCode(0x12) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x12)}; ;
		var  TIFFYCbCrPositioning  =  {"II" : String.fromCharCode(0x13) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x13)}; ;
		var  TIFFReferenceBlackWhite  =  {"II" : String.fromCharCode(0x14) + String.fromCharCode(0x02), "MM" : String.fromCharCode(0x02) + String.fromCharCode(0x14)}; ;
		var  TIFFCopyright  =  {"II" : String.fromCharCode(0x98) + String.fromCharCode(0x82), "MM" : String.fromCharCode(0x82) + String.fromCharCode(0x98)}; ;

		var  TIFFfile  =  [] ;

		var  filehandle  =  fopen(filename, "r") ;

		if (filehandle == FALSE) {
			this.FMError("parseTIFFfile cannot open file");
		}

		var  tiff  =  fread(filehandle, filesize(filename)) ;

		fclose(filehandle);

		var  byteorder  =  substr(tiff, 0, 2) ;
		var  filetype  =  substr(tiff, 2, 2) ;
		var  ifdoffset  =  substr(tiff, 4, 4) ;
		var  valueoffset  =  substr(tiff, 8, 4) ;

		if (byteorder == II) {

			if (filetype != String.fromCharCode(0x2a) + String.fromCharCode(0x00)) {

				this.FMError("parseTIFFfile -- not a TIFF file!");

			}

			ifdoffset  =  (ord(substr(ifdoffset, 3, 1)) * 256 + ord(substr(ifdoffset, 2, 1))) * 65536 + ord(substr(ifdoffset, 1, 1)) * 256 + ord(substr(ifdoffset, 0, 1)) ;

			valueoffset  =  (ord(substr(valueoffset, 3, 1)) * 256 + ord(substr(valueoffset, 2, 1))) * 65536 + ord(substr(valueoffset, 1, 1)) * 256 + ord(substr(valueoffset, 0, 1)) ;

		}

// //--------------------------------------------------
// //  unpack MM byte order TIFF.

		if (byteorder == MM) {

			this.FMError("Cannot handle MM byte order in TIFF files, yet");

		}

		var  ifdtags  =  substr(tiff, ifdoffset, 2) ;

// //--------------------------------------------------
// //  unpack II byte order TIFF.

		if (byteorder == II) {

			ifdtags  =  ord(substr(ifdtags, 1, 1)) * 256 + ord(substr(ifdtags, 0, 1)) ;

			for (n = 0; n < ifdtags; n++) {  //FORARG

				var  tag  =  substr(tiff, ifdoffset + 2 + n * 12, 2) ;

				var  valuetype  =  substr(tiff, ifdoffset + 2 + n * 12 + 2, 2) ;
				valuetype  =  ord(substr(valuetype, 1, 1)) * 256 + ord(substr(valuetype, 0, 1)) ;

				switch(tag) {

					case TIFFNewSubfileType["II"]:
						break;

					case TIFFSubfileType["II"]:
						break;

					case TIFFImageWidth["II"]:

						if (valuetype == 3) {

							var  imagewidth  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							imagewidth  =  ord(substr(imagewidth, 1, 1)) * 256 + ord(substr(imagewidth, 0, 1)) ;
							TIFFfile["ImageWidth"]  =  imagewidth ;

						} else if (valuetype == 4) {

							imagewidth  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
							imagewidth  =  (ord(substr(imagewidth, 3, 1)) * 256 + ord(substr(imagewidth, 2, 1))) * 65536 + ord(substr(imagewidth, 1, 1)) * 256 + ord(substr(imagewidth, 0, 1)) ;
							TIFFfile["ImageWidth"]  =  imagewidth ;

						} else {

							this.FMError("ImageWidth tag: wrong data type");

						}

						break;

					case TIFFImageLength["II"]:

						if (valuetype == 3) {

							var  imagelength  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							imagelength  =  ord(substr(imagelength, 1, 1)) * 256 + ord(substr(imagelength, 0, 1)) ;
							TIFFfile["ImageLength"]  =  imagelength ;

						} else if (valuetype == 4) {

							imagelength  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
							imagelength  =  (ord(substr(imagelength, 3, 1)) * 256 + ord(substr(imagelength, 2, 1))) * 65536 + ord(substr(imagelength, 1, 1)) * 256 + ord(substr(imagelength, 0, 1)) ;
							TIFFfile["ImageLength"]  =  imagelength ;

						} else {

							this.FMError("ImageLength tag: wrong data type");

						}

						break;

					case TIFFBitsPerSample["II"]:

						if (valuetype == 3) {

							var  nvalues  =  substr(tiff, ifdoffset + 2 + n * 12 + 4, 4) ;
							nvalues  =  (ord(substr(nvalues, 3, 1)) * 256 + ord(substr(nvalues, 2, 1))) * 65536 + ord(substr(nvalues, 1, 1)) * 256 + ord(substr(nvalues, 0, 1)) ;

							TIFFfile["BitsPerSample"]  =  [] ;

							if (nvalues == 1) {

								var  bitspersample  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
								bitspersample  =  ord(substr(bitspersample, 1, 1)) * 256 + ord(substr(bitspersample, 0, 1)) ;
								TIFFfile["BitsPerSample"][0]  =  bitspersample ;


							} else {

								var  voffset  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
								voffset  =  (ord(substr(voffset, 3, 1)) * 256 + ord(substr(voffset, 2, 1))) * 65536 + ord(substr(voffset, 1, 1)) * 256 + ord(substr(voffset, 0, 1)) ;

								for (counter = 0; counter < nvalues; counter++) {  //FORARG

									var  foffset  =  voffset + 2 * counter ;
									bitspersample  =  ord(substr(tiff, foffset + 1, 1)) * 256 + ord(substr(tiff, foffset, 1)) ;
									TIFFfile["BitsPerSample"][counter]  =  bitspersample ;

								}

							}

						} else {

							this.FMError("BitsPerSample: wrong tag value type");

						}

						break;

					case TIFFCompression["II"]:

						if (valuetype == 3) {

							var  compression  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							compression  =  ord(substr(compression, 1, 1)) * 256 + ord(substr(compression, 0, 1)) ;

							if (compression == 1) {

								TIFFfile["Compression"]  =  compression ;

							} else {

								this.FMError("Cannot handle this kind of compression yet");

							}

						} else {

							this.FMError("Compression tag: wrong data type");

						}

						if (TIFFfile["Compression"] != 1) {

							this.FMError("Cannot Handle compressed TIFF files, sorry+");

						}

						break;

					case TIFFPhotometricInterpretation["II"]:

						if (valuetype == 3) {

							var  interpretation  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							interpretation  =  ord(substr(interpretation, 1, 1)) * 256 + ord(substr(interpretation, 0, 1)) ;
							TIFFfile["PhotometricInterpretation"]  =  interpretation ;

						} else {

							this.FMError("PhotometricInterpretation tag: wrong data type");

						}

						break;

					case TIFFThresholding["II"]:
						break;

					case TIFFCellWidth["II"]:
						break;

					case TIFFCellLength["II"]:
						break;

					case TIFFFillOrder["II"]:

						if (valuetype == 3) {

							var  fillorder  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							fillorder  =  ord(substr(fillorder, 1, 1)) * 256 + ord(substr(fillorder, 0, 1)) ;
							TIFFfile["FillOrder"]  =  fillorder ;

						} else {

							this.FMError("FillOrder tag: wrong data type");

						}

						break;

					case TIFFDocumentName["II"]:
						break;

					case TIFFImageDescription["II"]:
						break;

					case TIFFMake["II"]:
						break;

					case TIFFModel["II"]:
						break;

					case TIFFStripOffsets["II"]:

						var  nvalues  =  substr(tiff, ifdoffset + 2 + n * 12 + 4, 4) ;
						nvalues  =  (ord(substr(nvalues, 3, 1)) * 256 + ord(substr(nvalues, 2, 1))) * 65536 + ord(substr(nvalues, 1, 1)) * 256 + ord(substr(nvalues, 0, 1)) ;
						var  voffset  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
						voffset  =  (ord(substr(voffset, 3, 1)) * 256 + ord(substr(voffset, 2, 1))) * 65536 + ord(substr(voffset, 1, 1)) * 256 + ord(substr(voffset, 0, 1)) ;

						TIFFfile["StripOffsets"]  =  [] ;

						if (valuetype == 3) {

							if (nvalues == 1) {

								TIFFfile["StripOffsets"][0]  =  voffset ;

							} else {

								for (counter = 0; counter < nvalues; counter++) {  //FORARG

									var  foffset  =  voffset + 2 * counter ;

									var  stripoffsets  =  ord(substr(tiff, foffset + 1, 1)) * 256 + ord(substr(tiff, foffset, 1)) ;
									TIFFfile["StripOffsets"][counter]  =  stripoffsets ;

								}

							}

						} else if (valuetype == 4) {

							if (nvalues == 1) {

								TIFFfile["StripOffsets"][0]  =  voffset ;

							} else {

								for (counter = 0; counter < nvalues; counter++) {  //FORARG

									var  foffset  =  voffset + 4 * counter ;

									var  stripoffsets  =  (ord(substr(tiff, foffset + 3, 1)) * 256 + ord(substr(tiff, foffset + 2, 1))) * 65536 + ord(substr(tiff, foffset + 1, 1)) * 256 + ord(substr(tiff, foffset, 1)) ;
									TIFFfile["StripOffsets"][counter]  =  stripoffsets ;

								}

							}

						} else {

							this.FMError("StripOffsets: wrong tag value type");

						}

						break;

					case TIFFOrientation["II"]:

						if (valuetype == 3) {

							var  subfiletype  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							subfiletype  =  ord(substr(subfiletype, 1, 1)) * 256 + ord(substr(subfiletype, 0, 1)) ;
							TIFFfile["Orientation"]  =  subfiletype ;

						} else {

							this.FMError("Orientation tag: wrong data type");

						}

						break;

					case TIFFSamplesPerPixel["II"]:

						if (valuetype == 3) {

							var  samplesperpixel  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							samplesperpixel  =  ord(substr(samplesperpixel, 1, 1)) * 256 + ord(substr(samplesperpixel, 0, 1)) ;
							TIFFfile["SamplesPerPixel"]  =  samplesperpixel ;

						} else {

							this.FMError("SamplesPerPixel tag: wrong data type");

						}

						break;

					case TIFFRowsPerStrip["II"]:

						if (valuetype == 3) {

							var  rowsperstrip  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							rowsperstrip  =  ord(substr(rowsperstrip, 1, 1)) * 256 + ord(substr(rowsperstrip, 0, 1)) ;
							TIFFfile["RowsPerStrip"]  =  rowsperstrip ;

						} else if (valuetype == 4) {

							rowsperstrip  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
							rowsperstrip  =  (ord(substr(rowsperstrip, 3, 1)) * 256 + ord(substr(rowsperstrip, 2, 1))) * 65536 + ord(substr(rowsperstrip, 1, 1)) * 256 + ord(substr(rowsperstrip, 0, 1)) ;
							TIFFfile["RowsPerStrip"]  =  rowsperstrip ;

						} else {

							this.FMError("RowsPerStrip tag: wrong data type");

						}

						break;

					case TIFFStripByteCounts["II"]:

						nvalues  =  substr(tiff, ifdoffset + 2 + n * 12 + 4, 4) ;
						nvalues  =  (ord(substr(nvalues, 3, 1)) * 256 + ord(substr(nvalues, 2, 1))) * 65536 + ord(substr(nvalues, 1, 1)) * 256 + ord(substr(nvalues, 0, 1)) ;
						voffset  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
						voffset  =  (ord(substr(voffset, 3, 1)) * 256 + ord(substr(voffset, 2, 1))) * 65536 + ord(substr(voffset, 1, 1)) * 256 + ord(substr(voffset, 0, 1)) ;

						TIFFfile["StripByteCounts"]  =  [] ;

						if (valuetype == 3) {

							if (nvalues == 1) {

								TIFFfile["StripByteCounts"][0]  =  voffset ;

							} else {

								for (counter = 0; counter < nvalues; counter++) {  //FORARG

									var  foffset  =  voffset + 2 * counter ;

									var  stripbytecounts  =  ord(substr(tiff, foffset + 1, 1)) * 256 + ord(substr(tiff, foffset, 1)) ;
									TIFFfile["StripByteCounts"][counter]  =  stripbytecounts ;

								}

							}

						} else if (valuetype == 4) {

							if (nvalues == 1) {

								TIFFfile["StripByteCounts"][0]  =  voffset ;

							} else {

								for (counter = 0; counter < nvalues; counter++) {  //FORARG

									var  foffset  =  voffset + 4 * counter ;

									var  stripbytecounts  =  (ord(substr(tiff, foffset + 3, 1)) * 256 + ord(substr(tiff, foffset + 2, 1))) * 65536 + ord(substr(tiff, foffset + 1, 1)) * 256 + ord(substr(tiff, foffset, 1)) ;
									TIFFfile["StripByteCounts"][counter]  =  stripbytecounts ;

								}

							}

						} else {

							this.FMError("StripByteCounts: wrong tag value type");

						}

						break;

					case TIFFMinSampleValue["II"]:
						break;

					case TIFFMaxSampleValue["II"]:
						break;

					case TIFFXResolution["II"]:
						break;

					case TIFFYResolution["II"]:
						break;

					case TIFFPlanarConfiguration["II"]:

						if (valuetype == 3) {

							var  planarconfiguration  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							planarconfiguration  =  ord(substr(planarconfiguration, 1, 1)) * 256 + ord(substr(planarconfiguration, 0, 1)) ;
							TIFFfile["PlanarConfiguration"]  =  planarconfiguration ;

						} else {

							this.FMError("PlanarConfiguration tag: wrong data type");

						}

						break;

					case TIFFPageName["II"]:
						break;

					case TIFFXPosition["II"]:
						break;

					case TIFFYPosition["II"]:
						break;

					case TIFFFreeOffsets["II"]:
						break;

					case TIFFFreeByteCounts["II"]:
						break;

					case TIFFGrayResponseUnit["II"]:
						break;

					case TIFFGrayResponseCurve["II"]:
						break;

					case TIFFT4Options["II"]:
						break;

					case TIFFT6Options["II"]:
						break;

					case TIFFResolutionUnit["II"]:
						break;

					case TIFFPageNumber["II"]:
						break;

					case TIFFTransferFunction["II"]:
						break;

					case TIFFSoftware["II"]:
						break;

					case TIFFDateTime["II"]:
						break;

					case TIFFArtist["II"]:
						break;

					case TIFFHostComputer["II"]:
						break;

					case TIFFPredictor["II"]:
						break;

					case TIFFWhitePoint["II"]:
						break;

					case TIFFPrimaryChromaticities["II"]:
						break;

					case TIFFColorMap["II"]:

						if (valuetype == 3) {

							nvalues  =  substr(tiff, ifdoffset + 2 + n * 12 + 4, 4) ;
							nvalues  =  ord(substr(nvalues, 1, 1)) * 256 + ord(substr(nvalues, 0, 1)) ;
							voffset  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 4) ;
							voffset  =  (ord(substr(voffset, 3, 1)) * 256 + ord(substr(voffset, 2, 1))) * 65536 + ord(substr(voffset, 1, 1)) * 256 + ord(substr(voffset, 0, 1)) ;

							TIFFfile["ColorMap"]  =  substr(tiff, voffset, 2 * nvalues) ;
						} else {

							this.FMError("ColorMap: wrong tag value type");

						}

						break;

					case TIFFHalftoneHints["II"]:
						break;

					case TIFFTileWidth["II"]:
						break;

					case TIFFTileLength["II"]:
						break;

					case TIFFTileOffsets["II"]:
						break;

					case TIFFTileByteCounts["II"]:
						break;

					case TIFFInkSet["II"]:
						break;

					case TIFFInkNames["II"]:
						break;

					case TIFFNumberOfInks["II"]:
						break;

					case TIFFExtraSamples["II"]:

						if (valuetype == 3) {

							var  extrasamples  =  substr(tiff, ifdoffset + 2 + n * 12 + 8, 2) ;
							extrasamples  =  ord(substr(extrasamples, 1, 1)) * 256 + ord(substr(extrasamples, 0, 1)) ;
							TIFFfile["ExtraSamples"]  =  extrasamples ;

						} else {

							this.FMError("ExtraSamples: wrong data type");

						}

						break;

					case TIFFSampleFormat["II"]:
						break;

					case TIFFSMinSampleValue["II"]:
						break;

					case TIFFSMaxSampleValue["II"]:
						break;

					case TIFFTransferRange["II"]:
						break;

					case TIFFJPEGProc["II"]:
						break;

					case TIFFJPEGInterchangeFormat["II"]:
						break;

					case TIFFJPEGInterchangeFormatLength["II"]:
						break;

					case TIFFJPEGRestartInterval["II"]:
						break;

					case TIFFJPEGLosslessPredictors["II"]:
						break;

					case TIFFJPEGPointTransforms["II"]:
						break;

					case TIFFJPEGQTables["II"]:
						break;

					case TIFFJPEGDCTables["II"]:
						break;

					case TIFFJPEGACTables["II"]:
						break;

					case TIFFYCbCrCoefficients["II"]:
						break;

					case TIFFYCbCrSubSampling["II"]:
						break;

					case TIFFYCbCrPositioning["II"]:
						break;

					case TIFFReferenceBlackWhite["II"]:
						break;

					case TIFFCopyright["II"]:
						break;
				}


			}

		}

// //--------------------------------------------------
// //  process TIFF data.

		var  bitmap  =  [] ;

		switch (TIFFfile["PhotometricInterpretation"]) {

// //--------------------------------------------------
// //  Bilevel - WhiteIsZero.

			case 0:

				if (!(in_array("BitsPerSample", TIFFfile))) {

				}

// //--------------------------------------------------
// //  build image stream.

				var  imagestream  =  "" ;
				var  nstrips  =  count(TIFFfile["StripOffsets"]) ;

				for(counter = 0; counter < nstrips; counter++) {  //FORARG
					imagestream += substr(tiff, TIFFfile["StripOffsets"][counter], TIFFfile["StripByteCounts"][counter]) ;

				}

				var  newimagestream  =  "" ;

				var  padcount  =  TIFFfile["ImageWidth"] % 4 ;

				if ((padcount) == 0) {

					var  padding  =  "" ;

				} else {

					padding  =  str_repeat(String.fromCharCode(0), 4 - padcount) ;
				}

				for(counter = 0; counter < TIFFfile["ImageLength"]; counter++) {  //FORARG

					newimagestream += substr(imagestream, counter * TIFFfile["ImageWidth"], TIFFfile["ImageWidth"]) + padding ;

				}

// //--------------------------------------------------
// //  create palettes.

				var  swfcolormap  =  "" ;

				if (AlphaPalette == null) {

					for(counter = 255; counter >= 0; counter--) {  //FORARG

						var  r  =  String.fromCharCode(counter) ;
						var  g  =  String.fromCharCode(counter) ;
						var  b  =  String.fromCharCode(counter) ;

						swfcolormap += r + g + b ;

					}

					bitmap["colortablesize"]   =  (strlen(swfcolormap) / 3) - 1 ;
				} else {

					var  a  =  [] ;

					for(counter = 0; counter < 256; counter++) {  //FORARG

						a[counter]  =  String.fromCharCode(255) ;
					}

					var  limita  =  sizeof(AlphaPalette) ;

					reset(AlphaPalette);

					for (counter = 0; counter < limita; counter++) {  //FORARG

						var  tmp  =  each(AlphaPalette) ;

						a[tmp["key"]]  =  String.fromCharCode(tmp["value"]) ;
					}

					for(counter = 255; counter >= 0; counter--) {  //FORARG

						var  r  =  String.fromCharCode(counter) ;
						var  g  =  String.fromCharCode(counter) ;
						var  b  =  String.fromCharCode(counter) ;

						swfcolormap += r + g + b + a[counter] ;

					}

					bitmap["colortablesize"]   =  (strlen(swfcolormap) / 4) - 1 ;
				}

				var  zlibbitmapdata  =  gzcompress(swfcolormap + newimagestream, 9) ;
				var  alphadata  =  gzcompress(imagestream, 9) ;

				break;

// //--------------------------------------------------
// //  Bilevel - BlackIsZero.

			case 1:


// //--------------------------------------------------
// //  build image stream.

				imagestream  =  "" ;
				nstrips  =  count(TIFFfile["StripOffsets"]) ;

				for(counter = 0; counter < nstrips; counter++) {  //FORARG
					imagestream += substr(tiff, TIFFfile["StripOffsets"][counter], TIFFfile["StripByteCounts"][counter]) ;

				}

				newimagestream  =  "" ;

				padcount  =  TIFFfile["ImageWidth"] % 4 ;

				if ((padcount) == 0) {

					var  padding  =  "" ;

				} else {

					padding  =  str_repeat(String.fromCharCode(0), 4 - padcount) ;
				}

				for(counter = 0; counter < TIFFfile["ImageLength"]; counter++) {  //FORARG

					newimagestream += substr(imagestream, counter * TIFFfile["ImageWidth"], TIFFfile["ImageWidth"]) + padding ;

				}

// //--------------------------------------------------
// //  create palette.

				swfcolormap  =  "" ;

				if (AlphaPalette == null) {

					for(counter = 0; counter < 256; counter++) {  //FORARG

						var  r  =  String.fromCharCode(counter) ;
						var  g  =  String.fromCharCode(counter) ;
						var  b  =  String.fromCharCode(counter) ;

						swfcolormap += r + g + b ;

					}

					bitmap["colortablesize"]   =  (strlen(swfcolormap) / 3) - 1 ;
				} else {

					var  a  =  [] ;

					for(counter = 0; counter < 256; counter++) {  //FORARG

						a[counter]  =  String.fromCharCode(255) ;
					}

					var  limita  =  sizeof(AlphaPalette) ;

					reset(AlphaPalette);

					for (counter = 0; counter < limita; counter++) {  //FORARG

						var  tmp  =  each(AlphaPalette) ;

						a[tmp["key"]]  =  String.fromCharCode(tmp["value"]) ;
					}

					for(counter = 0; counter < 256; counter++) {  //FORARG

						var  r  =  String.fromCharCode(counter) ;
						var  g  =  String.fromCharCode(counter) ;
						var  b  =  String.fromCharCode(counter) ;

						swfcolormap += r + g + b + a[counter] ;

					}

					bitmap["colortablesize"]   =  (strlen(swfcolormap) / 4) - 1 ;
				}

				zlibbitmapdata  =  gzcompress(swfcolormap + newimagestream, 9) ;
				alphadata  =  gzcompress(imagestream, 9) ;

				break;

// //--------------------------------------------------
// //  RGB.

			case 2:

				this.FMError("Cannot handle full-color images, use JPEG instead");

				break;

// //--------------------------------------------------
// //  Palette.

			case 3:

// //--------------------------------------------------
// //  build image stream.

				imagestream  =  "" ;
				nstrips  =  count(TIFFfile["StripOffsets"]) ;

				for(counter = 0; counter < nstrips; counter++) {  //FORARG
					imagestream += substr(tiff, TIFFfile["StripOffsets"][counter], TIFFfile["StripByteCounts"][counter]) ;

				}

				newimagestream  =  "" ;

				padcount  =  TIFFfile["ImageWidth"] % 4 ;

				if ((padcount) == 0) {

					var  padding  =  "" ;

				} else {

					padding  =  str_repeat(String.fromCharCode(0), 4 - padcount) ;
				}

				for(counter = 0; counter < TIFFfile["ImageLength"]; counter++) {  //FORARG

					newimagestream += substr(imagestream, counter * TIFFfile["ImageWidth"], TIFFfile["ImageWidth"]) + padding ;

				}

// //--------------------------------------------------
// //  reconfigure palette.

				var  newcolormap  =  "" ;
				var  limit  =  strlen(TIFFfile["ColorMap"]) ;

				for(counter = 0; counter < limit; counter++) {  //FORARG

					newcolormap += substr(TIFFfile["ColorMap"], 2 * counter, 1) ;
				}

				swfcolormap  =  "" ;

				limit  =  strlen(newcolormap) / 3 ;

				if (AlphaPalette == null) {

					for(counter = 0; counter < limit; counter++) {  //FORARG

						var  r  =  substr(newcolormap, counter, 1) ;
						var  g  =  substr(newcolormap, counter + limit, 1) ;
						var  b  =  substr(newcolormap, counter + limit, 1) ;
						swfcolormap += r + g + b ;
					}

					bitmap["colortablesize"]   =  (strlen(swfcolormap) / 3) - 1 ;

				} else {

					var  a  =  [] ;

					for(counter = 0; counter < 256; counter++) {  //FORARG

						a[counter]  =  String.fromCharCode(255) ;
					}

					var  limita  =  sizeof(AlphaPalette) ;

					reset(AlphaPalette);

					for (counter = 0; counter < limita; counter++) {  //FORARG

						var  tmp  =  each(AlphaPalette) ;

						a[tmp["key"]]  =  String.fromCharCode(tmp["value"]) ;
					}

					for(counter = 0; counter < 256; counter++) {  //FORARG

						var  r  =  substr(newcolormap, counter, 1) ;
						var  g  =  substr(newcolormap, counter + limit, 1) ;
						var  b  =  substr(newcolormap, counter + limit, 1) ;
						swfcolormap += r + g + b + a[counter] ;

					}

					bitmap["colortablesize"]   =  (strlen(swfcolormap) / 4) - 1 ;
				}

				zlibbitmapdata  =  gzcompress(swfcolormap + newimagestream, 9) ;
				alphadata  =  gzcompress(imagestream, 9) ;

				break;

// //--------------------------------------------------
// //  Transparency mask.

			case 4:

				this.FMError("Cannot handle images with transparency masks, use RGB + Alpha encoding");

				break;

		}

		bitmap["format"]  =  3 ;
		bitmap["width"]   =  TIFFfile["ImageWidth"] ;
		bitmap["height"]  =  TIFFfile["ImageLength"] ;
		bitmap["colortable"]  =  swfcolormap ;
		bitmap["newimagestream"]  =  newimagestream ;
		bitmap["zlibbitmapdata"]   =  zlibbitmapdata ;
		bitmap["alphadata"]  =  alphadata ;

		array_pop(this.FMDebug);

		return bitmap;

	}

FreeMovieCompiler.prototype.parseTrueTypefile  = function( filename )
	{
		array_push(this.FMDebug, "parseTrueTypefile");

		var  TTfile  =  [] ;

		var  filehandle  =  fopen(filename, "r") ;

		if (filehandle == FALSE) {
			this.FMError("parseTrueTypefile cannot open font file");
		}

		var  tt  =  fread(filehandle, filesize(filename)) ;

		fclose(filehandle);

// //--------------------------------------------------
// //  offset subtable

		var  ScalerType  =  substr(tt, 0, 4) ;

		if ((ScalerType == "true") || (ScalerType == String.fromCharCode(0x00) + String.fromCharCode(0x01) + String.fromCharCode(0x00) + String.fromCharCode(0x00))) {

			TTfile["OffsetSubtable"]  =  [] ;
			TTfile["OffsetSubtable"]["ScalerType"]  =  ScalerType ;
			TTfile["OffsetSubtable"]["numTables"]  =  ord(substr(tt, 4, 1)) * 256 + ord(substr(tt, 5, 1)) ;
			TTfile["OffsetSubtable"]["searchRange"]  =  ord(substr(tt, 6, 1)) * 256 + ord(substr(tt, 7, 1)) ;
			TTfile["OffsetSubtable"]["entrySelector"]  =  ord(substr(tt, 8, 1)) * 256 + ord(substr(tt, 9, 1)) ;
			TTfile["OffsetSubtable"]["rangeShift"]  =  ord(substr(tt, 10, 1)) * 256 + ord(substr(tt, 11, 1)) ;

		} else {

			this.FMError("parseTrueTypefile: Not a TrueType font");
		}

		for (counter = 0; counter < TTfile["OffsetSubtable"]["numTables"]; counter++) {  //FORARG

// //--------------------------------------------------
// //  read tag name

			var  tmp  =  12 + 16 * counter ;

			var  tag  =  substr(tt, tmp, 4) ;

			TTfile[tag]  =  [] ;

			TTfile[tag]["checksum"]  =   (ord(substr(tt, tmp + 4, 1)) * 256 + ord(substr(tt, tmp + 5, 1))) * 65536 + ord(substr(tt, tmp + 6, 1)) * 256 + ord(substr(tt, tmp + 7, 1)) ;
			TTfile[tag]["offset"]  =   (ord(substr(tt, tmp + 8, 1)) * 256 + ord(substr(tt, tmp + 9, 1))) * 65536 + ord(substr(tt, tmp + 10, 1)) * 256 + ord(substr(tt, tmp + 11, 1)) ;
			TTfile[tag]["length"]  =   (ord(substr(tt, tmp + 12, 1)) * 256 + ord(substr(tt, tmp + 13, 1))) * 65536 + ord(substr(tt, tmp + 14, 1)) * 256 + ord(substr(tt, tmp + 15, 1)) ;

		}

// //--------------------------------------------------
// //  decode "cmap" table

		if (TTfile["cmap"]["offset"] != null) {

			var  tmp  =  TTfile["cmap"]["offset"] ;

			TTfile["cmap"]["version"]  =  ord(substr(tt, tmp, 1)) * 256 + ord(substr(tt, tmp + 1, 1)) ;
			TTfile["cmap"]["nSubtables"]  =  ord(substr(tt, tmp + 2, 1)) * 256 + ord(substr(tt, tmp + 3, 1)) ;

			var  tmpa  =  tmp + 4 ;
// #error_log("--- cmap ---");
// #error_log("version: " . $TTfile["cmap"]["version"]);
// #error_log("nSubtables: " . $TTfile["cmap"]["nSubtables"]);

			for (counter = 0; counter < TTfile["cmap"]["nSubtables"]; counter++) {  //FORARG

				TTfile["cmap"]["subtables"][counter]["platformID"]  =  ord(substr(tt, tmpa, 1)) * 256 + ord(substr(tt, tmpa + 1, 1)) ;
				TTfile["cmap"]["subtables"][counter]["platformSpecificID"]  =  ord(substr(tt, tmpa + 2, 1)) * 256 + ord(substr(tt, tmpa + 3, 1)) ;
				TTfile["cmap"]["subtables"][counter]["offset"]  =  (ord(substr(tt, tmpa + 4, 1)) * 256 + ord(substr(tt, tmpa + 5, 1))) * 65536 + ord(substr(tt, tmpa + 6, 1)) * 256 + ord(substr(tt, tmpa + 7, 1)) ;
				tmpa += 8 ;
// #error_log("platformID: " . $TTfile["cmap"]["subtables"][$counter]["platformID"]);
// #error_log("platformSpecificID: " . $TTfile["cmap"]["subtables"][$counter]["platformSpecificID"]);
// #error_log("offset: " . $TTfile["cmap"]["subtables"][$counter]["offset"]);
			}

			for (counter = 0; counter < TTfile["cmap"]["nSubtables"]; counter++) {  //FORARG

				tmpa  =  tmp + TTfile["cmap"]["subtables"][counter]["offset"] ;

				TTfile["cmap"]["subtables"][counter]["format"]  =  ord(substr(tt, tmpa, 1)) * 256 + ord(substr(tt, tmpa + 1, 1)) ;
				TTfile["cmap"]["subtables"][counter]["length"]  =  ord(substr(tt, tmpa + 2, 1)) * 256 + ord(substr(tt, tmpa + 3, 1)) ;
				TTfile["cmap"]["subtables"][counter]["language"]  =  ord(substr(tt, tmpa + 4, 1)) * 256 + ord(substr(tt, tmpa + 5, 1)) ;
// #error_log("format: " . $TTfile["cmap"]["subtables"][$counter]["format"]);
// #error_log($TTfile["cmap"]["subtables"][$counter]["length"]);
// #error_log($TTfile["cmap"]["subtables"][$counter]["language"]);

				if (TTfile["cmap"]["subtables"][counter]["format"] == 0) {

					for (countert = 0; countert < 256; countert++) {  //FORARG
						TTfile["cmap"]["subtables"][counter]["glyphIndexArray"][countert]  =  ord(substr(tt, tmpa + 6 + countert, 1)) ;
// #error_log($TTfile["cmap"]["subtables"][$counter]["glyphIndexArray"][$countert]);
					}
				}

				if (TTfile["cmap"]["subtables"][counter]["format"] == 2) {

					for (countert = 0; countert < 256; countert++) {  //FORARG
						TTfile["cmap"]["subtables"][counter]["subHeaderKeys"][countert]  =  ord(substr(tt, tmpa + 6 + countert, 1)) ;
// #error_log($TTfile["cmap"]["subtables"][$counter]["glyphIndexArray"][$countert]);
					}
				}


			}

		} else {

			this.FMError("parseTrueTypefile: no cmap table+++ cannot create proper font mappings");
		}

// //--------------------------------------------------
// //  decode "name" table

		if (TTfile["name"]["offset"] != null) {

			var  tmp  =  TTfile["name"]["offset"] ;

			TTfile["name"]["format"]  =  ord(substr(tt, tmp, 1)) * 256 + ord(substr(tt, tmp + 1, 1)) ;
			TTfile["name"]["count"]  =  ord(substr(tt, tmp + 2, 1)) * 256 + ord(substr(tt, tmp + 3, 1)) ;
			TTfile["name"]["stringOffset"]  =  ord(substr(tt, tmp + 4, 1)) * 256 + ord(substr(tt, tmp + 5, 1)) ;

			for (counter = 0; counter < TTfile["name"]["count"]; counter++) {  //FORARG
				var  tmpa  =  tmp + 6 + counter * 12 ;

				TTfile["name"]["records"][counter]["platformID"]  =  ord(substr(tt, tmpa, 1)) * 256 + ord(substr(tt, tmpa + 1, 1)) ;
				TTfile["name"]["records"][counter]["platformSpecificID"]  =  ord(substr(tt, tmpa + 2, 1)) * 256 + ord(substr(tt, tmpa + 3, 1)) ;
				TTfile["name"]["records"][counter]["languageID"]  =  ord(substr(tt, tmpa + 4, 1)) * 256 + ord(substr(tt, tmpa + 5, 1)) ;
				TTfile["name"]["records"][counter]["nameID"] =ord(substr(tt, tmpa + 6, 1)) * 256 + ord(substr(tt, tmpa + 7, 1));
				TTfile["name"]["records"][counter]["length"] =ord(substr(tt, tmpa + 8, 1)) * 256 + ord(substr(tt, tmpa + 9, 1));
				TTfile["name"]["records"][counter]["offset"] =ord(substr(tt, tmpa + 10, 1)) * 256 + ord(substr(tt, tmpa + 11, 1));
				TTfile["name"]["records"]["namestring"][counter]  =  substr(tt, tmp + TTfile["name"]["records"][counter]["offset"], TTfile["name"]["records"][counter]["length"]) ;

			}

		} else {

			this.FMError("parseTrueTypefile: no name table+++ cannot create proper font name entry");
		}

// //--------------------------------------------------
// //  decode "post" table

		if (TTfile["post"]["offset"] != null) {

			var  tmp  =  TTfile["post"]["offset"] ;

			TTfile["post"]["format"]  =  ord(substr(tt, tmp, 1)) * 256 + ord(substr(tt, tmp + 1, 1)) + (ord(substr(tt, tmp + 2, 1)) * 256 + ord(substr(tt, tmp + 3, 1))) / 100000 ;

			var  f_int  =  ord(substr(tt, tmp + 4, 1)) * 256 + ord(substr(tt, tmp + 5, 1)) ;
			f_fra = Math.round(
					(ord(
						substr(tt, tmp + 6, 1)
					) * 256
	 				+
					ord(
						substr(tt, tmp + 7, 1)
					)) / 100000, 4
			);

			if (f_int > 32767) {

				f_int  =  -(f_int - 32768) ;
				var  f_fra  =  -f_fra ;
			}

			TTfile["post"]["italicAngle"]  =  f_int + f_fra ;

			f_int  =  ord(substr(tt, tmp + 8, 1)) * 256 + ord(substr(tt, tmp + 9, 1)) ;
			if (f_int > 32767) {

				f_int  =  -(f_int - 32768) ;
			}
			TTfile["post"]["underlinePosition"]  =  f_int ;

			f_int  =  ord(substr(tt, tmp + 10, 1)) * 256 + ord(substr(tt, tmp + 11, 1)) ;
			if (f_int > 32767) {

				f_int  =  -(f_int - 32768) ;
			}
			TTfile["post"]["underlineThickness"]  =  f_int ;

			f_int  =  ord(substr(tt, tmp + 12, 1)) * 256 + ord(substr(tt, tmp + 13, 1)) ;
			TTfile["post"]["isFixedPitch"]  =  f_int ;

			f_int  =  ord(substr(tt, tmp + 14, 1)) * 256 + ord(substr(tt, tmp + 15, 1)) ;
			TTfile["post"]["reserved"]  =  f_int ;

			TTfile["post"]["minMemType42"]  =  (ord(substr(tt, tmp + 16, 1)) * 256 + ord(substr(tt, tmp + 17, 1))) * 65536 + ord(substr(tt, tmp + 18, 1)) * 256 + ord(substr(tt, tmp + 19, 1)) ;
			TTfile["post"]["maxMemType42"]  =  (ord(substr(tt, tmp + 20, 1)) * 256 + ord(substr(tt, tmp + 21, 1))) * 65536 + ord(substr(tt, tmp + 22, 1)) * 256 + ord(substr(tt, tmp + 23, 1)) ;
			TTfile["post"]["minMemType1"]  =  (ord(substr(tt, tmp + 24, 1)) * 256 + ord(substr(tt, tmp + 25, 1))) * 65536 + ord(substr(tt, tmp + 26, 1)) * 256 + ord(substr(tt, tmp + 27, 1)) ;
			TTfile["post"]["maxMemType1"]  =  (ord(substr(tt, tmp + 28, 1)) * 256 + ord(substr(tt, tmp + 29, 1))) * 65536 + ord(substr(tt, tmp + 30, 1)) * 256 + ord(substr(tt, tmp + 31, 1)) ;

			if (TTfile["post"]["format"] = 2) {

				tmp += 32 ;

				var  nGlyphs  =  ord(substr(tt, tmp, 1)) * 256 + ord(substr(tt, tmp + 1, 1)) ;
				TTfile["post"]["subtable"]["nGlyphs"]  =  nGlyphs ;
				tmp += 2 ;

				for (counter = 0; counter < nGlyphs; counter++) {  //FORARG

					TTfile["post"]["subtable"]["GlyphIDs"][counter]  =  ord(substr(tt, tmp, 1)) * 256 + ord(substr(tt, tmp + 1, 1)) ;
					tmp += 2 ;
				}

				for (counter = 0; counter < nGlyphs; counter++) {  //FORARG
					TTfile["post"]["subtable"]["GlyphNames"][counter]  =  substr(tt, tmp + 1, ord(substr(tt, tmp, 1))) ;
					tmp += 1 + strlen(TTfile["post"]["subtable"]["GlyphNames"][counter]) ;
				}
			}

			if (TTfile["post"]["format"] = 2+5) {

				tmp += 32 ;

				var  nGlyphs  =  ord(substr(tt, tmp, 1)) * 256 + ord(substr(tt, tmp + 1, 1)) ;
				TTfile["post"]["subtable"]["nGlyphs"]  =  nGlyphs ;

				tmp += 2 ;

				for (counter = 0; counter < nGlyphs; counter++) {  //FORARG
					var  toff  =  ord(substr(tt, tmp, 1)) ;

					if (toff > 127) {

						toff  =  -(toff - 128) ;
					}

					TTfile["post"]["subtable"]["offset"][counter]  =  toff ;
					tmp += 1 ;
				}

				for (counter = 0; counter < nGlyphs; counter++) {  //FORARG
					TTfile["post"]["subtable"]["GlyphNames"][counter]  =  substr(tt, tmp + 1, ord(substr(tt, tmp, 1))) ;
					tmp += 1 + strlen(TTfile["post"]["subtable"]["GlyphNames"][counter]) ;
// #error_log($TTfile["post"]["subtable"]["GlyphNames"][$counter]);
				}
			}

/**
			TTfile["post"]["count"]  =  ord(substr(tt, tmp + 2, 1)) * 256 + ord(substr(tt, tmp + 3, 1)) ;
			TTfile["post"]["stringOffset"]  =  ord(substr(tt, tmp + 4, 1)) * 256 + ord(substr(tt, tmp + 5, 1)) ;

// #error_log("--- listing post table ---");
// #error_log("post tag format: " . $TTfile["post"]["format"]);
// #error_log("post tag table count: " . $TTfile["post"]["count"]);
// #error_log("post tag stringOffset: " . $TTfile["post"]["stringOffset"]);

			for (counter = 0; counter < TTfile["post"]["count"]; counter++) {  //FORARG
				var  tmpa  =  tmp + 6 + counter * 12 ;

				TTfile["post"]["records"][counter]["platformID"]  =  ord(substr(tt, tmpa, 1)) * 256 + ord(substr(tt, tmpa + 1, 1)) ;
				TTfile["post"]["records"][counter]["platformSpecificID"]  =  ord(substr(tt, tmpa + 2, 1)) * 256 + ord(substr(tt, tmpa + 3, 1)) ;
				TTfile["post"]["records"][counter]["languageID"]  =  ord(substr(tt, tmpa + 4, 1)) * 256 + ord(substr(tt, tmpa + 5, 1)) ;
				TTfile["post"]["records"][counter]["nameID"] =ord(substr(tt, tmpa + 6, 1)) * 256 + ord(substr(tt, tmpa + 7, 1));
				TTfile["post"]["records"][counter]["length"] =ord(substr(tt, tmpa + 8, 1)) * 256 + ord(substr(tt, tmpa + 9, 1));
				TTfile["post"]["records"][counter]["offset"] =ord(substr(tt, tmpa + 10, 1)) * 256 + ord(substr(tt, tmpa + 11, 1));
				TTfile["post"]["records"]["namestring"][counter]  =  substr(tt, tmp + TTfile["name"]["records"][counter]["offset"], TTfile["name"]["records"][counter]["length"]) ;

			}
**/
		} else {

			this.FMError("parseTrueTypefile: no post table+++ cannot create proper TrueType to PostScript table");

		}



		if (in_array("glyf", TTfile)) {

// #error_log("Found glyf table");

		} else {

			this.FMError("parseTrueTypefile: no glyph table+++ cannot create glyph outlines");
		}

	}

FreeMovieCompiler.prototype.packSOUNDINFO  = function( SyncFlags, HasEnvelope, HasLoops, HasOutPoint, HasInPoint, InPoint, OutPoint, LoopCount, nEnvelopePoints, Envelope )
	{
		array_push(this.FMDebug, "packSOUNDINFO");

		var  SOUNDINFO   =  this.packnBits(SyncFlags, 4) ;
		SOUNDINFO += HasEnvelope ;
		SOUNDINFO += HasLoops ;
		SOUNDINFO += HasOutPoint ;
		SOUNDINFO += HasInPoint ;

		SOUNDINFO   =  this.packBitValues(SOUNDINFO) ;

		if (HasInPoint) {

			SOUNDINFO += this.packUI32(InPoint) ;
		}

		if (HasOutPoint) {

			SOUNDINFO += this.packUI32(OutPoint) ;
		}

		if (HasLoops) {

			SOUNDINFO += this.packUI16(LoopCount) ;
		}

		if (HasEnvelope) {

			SOUNDINFO += this.packUI8(nEnvelopePoints) ;
			SOUNDINFO += Envelope ;
		}

		array_pop(this.FMDebug);

		return SOUNDINFO;
	}

FreeMovieCompiler.prototype.packSOUNDENVELOPE  = function( Mark44, Level0, Level1 )
	{
		array_push(this.FMDebug, "packSOUNDENVELOPE");

		var  SOUNDENVELOPE   =  this.packUI32(Mark44) ;
		SOUNDENVELOPE += this.packUI16(Level0) ;
		SOUNDENVELOPE += this.packUI16(Level1) ;

		array_pop(this.FMDebug);

		return SOUNDENVELOPE;
	}

FreeMovieCompiler.prototype.packADPCMSOUNDDATA  = function(  )
	{

	}

FreeMovieCompiler.prototype.packADPCMPACKET16STEREO  = function(  )
	{

	}

FreeMovieCompiler.prototype.packADPCMCODEDATA  = function(  )
	{

	}

FreeMovieCompiler.prototype.packMP3FRAME  = function(  )
	{

	}

FreeMovieCompiler.prototype.packMP3SOUNDDATA  = function(  )
	{

	}

FreeMovieCompiler.prototype.packMP3STREAMSOUNDDATA  = function(  )
	{

	}

FreeMovieCompiler.prototype.packACTIONRECORD  = function(  )
	{

	}

FreeMovieCompiler.prototype.packActionGotoFrame  = function( Frame )
	{
		array_push(this.FMDebug, "packActionGotoFrame");

		var  ActionID  =  this.packUI8(0x81) ;
		var  ActionLength  =  this.packUI16(2) ;
		var  Frame  =  this.packUI16(Frame) ;
		var  ActionGotoFrame  =  ActionID + ActionLength + Frame ;

		array_pop(this.FMDebug);

		return ActionGotoFrame;
	}

FreeMovieCompiler.prototype.packActionGetURL  = function( URLString, TargetString )
	{
		array_push(this.FMDebug, "packActionGetURL");

		var  ActionID  =  this.packUI8(0x83) ;
		var  URLString  =  this.packSTRING(URLString) ;
		var  TargetString  =  this.packSTRING(TargetString) ;
		var  ActionLength  =  this.packUI16(strlen(URLString + TargetString)) ;
		var  ActionGetURL  =  ActionID + ActionLength + URLString + TargetString ;

		array_pop(this.FMDebug);

		return ActionGetURL;
	}

FreeMovieCompiler.prototype.packActionNextFrame  = function(  )
	{
		array_push(this.FMDebug, "packActionNextFrame");

		var  ActionID  =  this.packUI8(0x04) ;
		var  ActionNextFrame  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionNextFrame;
	}

FreeMovieCompiler.prototype.packActionPreviousFrame  = function(  )
	{
		array_push(this.FMDebug, "packActionPreviousFrame");

		var  ActionID  =  this.packUI8(0x05) ;
		var  ActionPrevFrame  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionPrevFrame;
	}

FreeMovieCompiler.prototype.packActionPlay  = function(  )
	{
		array_push(this.FMDebug, "packActionPlay");

		var  ActionID  =  this.packUI8(0x06) ;
		var  ActionPlay  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionPlay;
	}

FreeMovieCompiler.prototype.packActionStop  = function(  )
	{
		array_push(this.FMDebug, "packActionStop");

		var  ActionID  =  this.packUI8(0x07) ;
		var  ActionStop  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStop;

	}

FreeMovieCompiler.prototype.packActionToggleQuality  = function(  )
	{
		array_push(this.FMDebug, "packActionToggleQuality");

		var  ActionID  =  this.packUI8(0x08) ;
		var  ActionToggleQuality  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionToggleQuality;
	}

FreeMovieCompiler.prototype.packActionStopSounds  = function(  )
	{
		array_push(this.FMDebug, "packActionStopSounds");

		var  ActionID  =  this.packUI8(0x09) ;
		var  ActionStopSounds  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStopSounds;
	}

FreeMovieCompiler.prototype.packActionWaitForFrame  = function( Frame, SkipCount )
	{
		array_push(this.FMDebug, "packActionWaitForFrame");

		var  ActionID  =  this.packUI8(0x8A) ;
		var  ActionLength  =  this.packUI16(3) ;
		var  Frame  =  this.packUI16(Frame) ;
		var  SkipCount  =  this.packUI8(SkipCount) ;
		var  ActionWaitForFrame  =  ActionID + ActionLength + Frame + SkipCount ;

		array_pop(this.FMDebug);

		return ActionWaitForFrame;
	}

FreeMovieCompiler.prototype.packActionSetTarget  = function( Target )
	{
		array_push(this.FMDebug, "packActionSetTarget");

		var  ActionID  =  this.packUI8(0x8B) ;
		var  Target  =  this.packSTRING(Target) ;
		var  ActionLength  =  this.packUI16(Target) ;
		var  ActionSetTarget  =  ActionID + ActionLength + Target ;

		array_pop(this.FMDebug);

		return ActionSetTarget;
	}

FreeMovieCompiler.prototype.packActionGoToLabel  = function( Label )
	{
		array_push(this.FMDebug, "packActionGotoLabel");

		var  ActionID  =  this.packUI8(0x8B) ;
		var  Label  =  this.packSTRING(Label) ;
		var  ActionLength  =  this.packUI16(Label) ;
		var  ActionGotoLabel  =  ActionID + ActionLength + Label ;

		array_pop(this.FMDebug);

		return ActionGotoLabel;
	}

FreeMovieCompiler.prototype.packActionPush  = function( Type, Value )
	{
		array_push(this.FMDebug, "packActionPush");

		var  ActionID  =  this.packUI8(0x96) ;

		if (Type == 0) {

			var  Type  =  this.packUI8(Type) ;
			var  Value  =  this.packSTRING(Value) ;

		} else if (Type == 1) {

			Type  =  this.packUI8(Type) ;
			Value  =  this.packFLOAT(Value) ;
		}

		var  ActionPush  =  ActionID + Type + Value ;

		array_pop(this.FMDebug);

		return ActionPush;
	}

FreeMovieCompiler.prototype.packActionPop  = function(  )
	{
		array_push(this.FMDebug, "packActionPop");

		var  ActionID  =  this.packUI8(0x17) ;

		var  ActionPop  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionPop;
	}

FreeMovieCompiler.prototype.packActionAdd  = function(  )
	{
		array_push(this.FMDebug, "packActionAdd");

		var  ActionID  =  this.packUI8(0x0A) ;

		var  ActionAdd  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionAdd;
	}

FreeMovieCompiler.prototype.packActionSubtract  = function(  )
	{
		array_push(this.FMDebug, "packActionSubtract");

		var  ActionID  =  this.packUI8(0x0B) ;

		var  ActionSubtract  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionSubtract;
	}

FreeMovieCompiler.prototype.packActionMultiply  = function(  )
	{
		array_push(this.FMDebug, "packActionMultiply");

		var  ActionID  =  this.packUI8(0x0C) ;

		var  ActionMultiply  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionMultiply;
	}

FreeMovieCompiler.prototype.packActionDivide  = function(  )
	{
		array_push(this.FMDebug, "packActionDivide");

		var  ActionID  =  this.packUI8(0x0D) ;

		var  ActionDivide  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionDivide;
	}

FreeMovieCompiler.prototype.packActionEquals  = function(  )
	{
		array_push(this.FMDebug, "packActionEquals");

		var  ActionID  =  this.packUI8(0x0E) ;

		var  ActionEquals  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionEquals;
	}

FreeMovieCompiler.prototype.packActionLess  = function(  )
	{
		array_push(this.FMDebug, "packActionLess");

		var  ActionID  =  this.packUI8(0x0F) ;

		var  ActionLess  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionLess;
	}

FreeMovieCompiler.prototype.packActionAnd  = function(  )
	{
		array_push(this.FMDebug, "packActionAnd");

		var  ActionID  =  this.packUI8(0x10) ;

		var  ActionAnd  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionAnd;
	}

FreeMovieCompiler.prototype.packActionOr  = function(  )
	{
		array_push(this.FMDebug, "packActionOr");

		var  ActionID  =  this.packUI8(0x11) ;

		var  ActionOr  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionOr;
	}

FreeMovieCompiler.prototype.packActionNot  = function(  )
	{
		array_push(this.FMDebug, "packActionNot");

		var  ActionID  =  this.packUI8(0x12) ;

		var  ActionNot  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionNot;
	}

FreeMovieCompiler.prototype.packActionStringEquals  = function(  )
	{
		array_push(this.FMDebug, "packActionStringEquals");

		var  ActionID  =  this.packUI8(0x13) ;

		var  ActionStringEquals  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringEquals;
	}

FreeMovieCompiler.prototype.packActionStringLength  = function(  )
	{
		array_push(this.FMDebug, "packActionStringLength");

		var  ActionID  =  this.packUI8(0x14) ;

		var  ActionStringLength  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringLength;
	}

FreeMovieCompiler.prototype.packActionStringAdd  = function(  )
	{
		array_push(this.FMDebug, "packActionStringAdd");

		var  ActionID  =  this.packUI8(0x21) ;

		var  ActionStringAdd  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringAdd;
	}

FreeMovieCompiler.prototype.packActionStringExtract  = function(  )
	{
		array_push(this.FMDebug, "packActionStringExtract");

		var  ActionID  =  this.packUI8(0x15) ;

		var  ActionStringExtract  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringExtract;
	}

FreeMovieCompiler.prototype.packActionStringLess  = function(  )
	{
		array_push(this.FMDebug, "packActionStringLess");

		var  ActionID  =  this.packUI8(0x29) ;

		var  ActionStringLess  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringLess;
	}

FreeMovieCompiler.prototype.packActionMBStringLength  = function(  )
	{
		array_push(this.FMDebug, "packActionMBStringLength");

		var  ActionID  =  this.packUI8(0x31) ;

		var  ActionStringLength  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringLength;
	}

FreeMovieCompiler.prototype.packActionMBStringExtract  = function(  )
	{
		array_push(this.FMDebug, "packActionMBStringExtract");

		var  ActionID  =  this.packUI8(0x35) ;

		var  ActionStringExtract  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionStringExtract;
	}

FreeMovieCompiler.prototype.packActionToInteger  = function(  )
	{
		array_push(this.FMDebug, "packActionToInteger");

		var  ActionID  =  this.packUI8(0x18) ;

		var  ActionToInteger  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionToInteger;
	}

FreeMovieCompiler.prototype.packActionCharToAscii  = function(  )
	{
		array_push(this.FMDebug, "packActionCharToASCII");

		var  ActionID  =  this.packUI8(0x32) ;

		var  ActionCharToASCII  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionCharToASCII;
	}

FreeMovieCompiler.prototype.packActionAsciiToChar  = function(  )
	{
		array_push(this.FMDebug, "packActionASCIIToChar");

		var  ActionID  =  this.packUI8(0x33) ;

		var  ActionASCIIToChar  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionASCIIToChar;
	}

FreeMovieCompiler.prototype.packActionMBCharToAscii  = function(  )
	{
		array_push(this.FMDebug, "packActionMBCharToASCII");

		var  ActionID  =  this.packUI8(0x36) ;

		var  ActionMBCharToASCII  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionMBCharToASCII;
	}

FreeMovieCompiler.prototype.packActionMBAsciiToChar  = function(  )
	{
		array_push(this.FMDebug, "packActionMBASCIIToChar");

		var  ActionID  =  this.packUI8(0x37) ;

		var  ActionMBASCIIToChar  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionMBASCIIToChar;
	}

FreeMovieCompiler.prototype.packActionJump  = function( Offset )
	{
		array_push(this.FMDebug, "packActionJump");

		var  ActionID  =  this.packUI8(0x99) ;

		var  Offset  =  this.packSI16(Offset) ;

		var  ActionJump  =  ActionID + Offset ;

		array_pop(this.FMDebug);

		return ActionJump;
	}

FreeMovieCompiler.prototype.packActionIf  = function(  )
	{
		array_push(this.FMDebug, "packActionIf");

		var  ActionID  =  this.packUI8(0x9A) ;

		var  Offset  =  this.packSI16(Offset) ;

		var  ActionIf  =  ActionID + Offset ;

		array_pop(this.FMDebug);

		return ActionIf;
	}

FreeMovieCompiler.prototype.packActionCall  = function(  )
	{
		array_push(this.FMDebug, "packActionCall");

		var  ActionID  =  this.packUI8(0x37) ;

		var  ActionCall  =  ActionID ;

		array_pop(this.FMDebug);

		return ActionCall;
	}

FreeMovieCompiler.prototype.packActionGetVariables  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionSetVariables  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionGetURL2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionGotoFrame2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionSetTarget2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionGetProperty  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionSetProperty  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionCloneSprite  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionRemoveSprite  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionStartDrag  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionEndDrag  = function(  )
	{
	}

FreeMovieCompiler.prototype.packWaitForFrame2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionTrace  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionGetTime  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionRandomNumber  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionCallFunction  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionCallMethod  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionConstantPool  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionDefineFunction  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionDefineLocal  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionDefineLocal2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionDelete  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionDelete2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionEnumerate  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionEquals2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionGetMember  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionInitArray  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionInitObject  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionNewMethod  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionNewObject  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionSetMember  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionTargetPath  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionWith  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionToNumber  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionToString  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionTypeOf  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionAdd2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionLess2  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionModulo  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionBitAnd  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionBitLShift  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionBitOr  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionBitRShift  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionBitURShift  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionBitXor  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionDecrement  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionIncrement  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionPushDuplicate  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionReturn  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionStackSwap  = function(  )
	{
	}

FreeMovieCompiler.prototype.packActionStoreRegister  = function(  )
	{
	}

FreeMovieCompiler.prototype.packBUTTONRECORD  = function(  )
	{
	}

FreeMovieCompiler.prototype.packDefineButtonxform  = function(  )
	{
	}

FreeMovieCompiler.prototype.packDefineButtonSound  = function(  )
	{
	}


// //------------------------------------------------//
// //                                                //
// //                      Tags                      //
// //                                                //
// //------------------------------------------------//

// //--------------------------------------------------
// //  null AutoSetSWFVersion(integer version)
// //  sets the SWF file version number to version.
// //  NOTE: don't call this function directly.  Use
// //        SetSWFVersion() from the Toolbox instead.

FreeMovieCompiler.prototype.AutoSetSWFVersion  = function( version )
	{
		array_push(this.FMDebug, "AutoSetSWFVersion");

		if (this.SWFVersion < version) {

this.SWFVersion  =  /*(int)*/ version ; //TYPE A.b
		}

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packRECORDHEADER(integer TagID,
// //                               integer TagLength)
// //  returns the SWF RECORDHEADER string.

FreeMovieCompiler.prototype.packRECORDHEADER  = function( TagID, TagLength )
	{
		array_push(this.FMDebug, "packRECORDHEADER");

		var  lower_limit  =  0 ;
		var  upper_short_tag_limit  =  62 ;
		var  upper_long_tag_limit  =  2147483647 ;

        	if (!(is_integer(TagLength))) {

                	this.FMError("packRECORDHEADER argument (TagLength) not an integer");
        	}

        	if (TagLength < lower_limit) {

                	this.FMError("packRECORDHEADER argument (TagLength) negative");
        	}

        	if (TagLength > upper_short_tag_limit) {

			if (TagLength > upper_long_tag_limit) {

                		this.FMError("packRECORDHEADER argument (TagLength) out of range");
			} else {

				var  atom   =  TagID << 6 ;
				atom += 0x3f ;
				atom   =  this.packUI16(atom) ;
				atom += this.packUI32(TagLength) ;
			}
        	} else {

			var  atom   =  TagID << 6 ;
			atom += TagLength ;
			atom   =  this.packUI16(atom) ;
		}

		array_pop(this.FMDebug);

		return atom;
	}

// //--------------------------------------------------
// //  string packEndTag()
// //  returns an SWF End Tag string.
// //  TagID: 0

FreeMovieCompiler.prototype.packEndTag  = function(  )
	{
		array_push(this.FMDebug, "packEndTag");

		var  TagID  =  0 ;
		var  TagLength  =  0 ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packShowFrameTag()
// //  returns an SWF ShowFrameTag string.
// //  TagID: 1

FreeMovieCompiler.prototype.packShowFrameTag  = function(  )
	{
		array_push(this.FMDebug, "packShowFrameTag");

		var  TagID  =  1 ;
		var  TagLength  =  0 ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  null packDefineShapeTag(integer ShapeID,
// //        string ShapeBounds, string SHAPEWITHSTYLE)
// //  returns an SWF DefineShapeTag string.
// //  TagID: 2

FreeMovieCompiler.prototype.packDefineShapeTag  = function( ShapeID, ShapeBounds, SHAPEWITHSTYLE )
	{
		array_push(this.FMDebug, "packDefineShapeTag");
		var  TagID  =  2 ;

		var  DefineShapeTag  =  this.packUI16(ShapeID) + ShapeBounds + SHAPEWITHSTYLE ;

		var  TagLength  =  strlen(DefineShapeTag) ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + DefineShapeTag ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packPlaceObjectTag(integer CharacterID,
// //      integer Depth, string MATRIX, string CXFORM)
// //  return an SWF PlaceObject tag string.
// //  TagID: 4

FreeMovieCompiler.prototype.packPlaceObjectTag  = function( CharacterID, Depth, MATRIX, CXFORM )
	{
		array_push(this.FMDebug, "packPlaceObjectTag");

		var  TagID  =  4 ;

		CharacterID  =  this.packUI16(CharacterID) ;
		var  Depth  =  this.packUI16(Depth) ;
		var  TagLength  =  strlen(CharacterID + Depth + MATRIX + CXFORM) ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + CharacterID + Depth + MATRIX + CXFORM ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packRemoveObjectTag(integer CharacterID,
// //                                    integer Depth)
// //  returns an SWF RemoveObject tag string.
// //  TagID: 5

FreeMovieCompiler.prototype.packRemoveObjectTag  = function( CharacterID, Depth )
	{
		array_push(this.FMDebug, "packRemoveObjectTag");
// #error_log($CharacterID);
		var  TagID  =  5 ;

		CharacterID  =  this.packUI16(CharacterID) ;
		var  Depth  =  this.packUI16(/*(int)*/Depth) ;

		var  TagLength  =  strlen(CharacterID + Depth) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + CharacterID + Depth ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packDefineBitsTag(integer BitmapID,
// //                           string BitmapJPEGImage)
// //  return an SWF DefineBits tag string.
// //  TagID: 6

FreeMovieCompiler.prototype.packDefineBitsTag  = function( CharacterID, BitmapJPEGImage )
	{
		array_push(this.FMDebug, "packDefineBitsTag");

		var  TagID  =  6 ;
		var  BitmapID  =  this.packUI16(CharacterID) ;
		var  TagLength  =  strlen(BitmapID + BitmapJPEGImage) ;
		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + BitmapID + BitmapJPEGImage ;

		array_pop(this.FMDebug);
	}

FreeMovieCompiler.prototype.packDefineButtonTag  = function(  )
	{
		array_push(this.FMDebug, "packDefineButtonTag");
		array_pop(this.FMDebug);
	}

FreeMovieCompiler.prototype.packDefineButton2Tag  = function(  )
	{
		array_push(this.FMDebug, "packDefineButton2Tag");
		array_pop(this.FMDebug);

	}

// //--------------------------------------------------
// //  string packJPEGTablesTag(
// //                        string BitmapJPEGEncoding)
// //  returns an SWF JPEGTablesTag string.
// //  TagID: 8

FreeMovieCompiler.prototype.packJPEGTablesTag  = function( BitmapJPEGEncoding )
	{
		array_push(this.FMDebug, "packJPEGTablesTag");

		var  TagID  =  8 ;
		var  TagLength  =  strlen(BitmapJPEGEncoding) ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + BitmapJPEGEncoding ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packSetBackgroundColorTag(integer R,
// //                             integer G, integer B)
// //  return an SWF SetBackgroundColorTag string.
// //  TagID: 9

FreeMovieCompiler.prototype.packSetBackgroundColorTag  = function( R, G, B )
	{
		array_push(this.FMDebug, "packSetBackgroundColorTag");

		var  TagID  =  9 ;
		var  RGB  =  this.packRGB(R, G, B) ;
		var  TagLength  =  strlen(RGB) ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + RGB ;

		array_pop(this.FMDebug);
	}

FreeMovieCompiler.prototype.packDoActionTag  = function(  )
	{
		array_push(this.FMDebug, "packDoActionTag");
		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packDefineSoundTag(integer CharacterID,
// //          integer SoundFormat, integer SoundRate,
// //            integer SoundSize, integer SoundType,
// //       integer SoundSampleCount, string SoundFile)
// //  returns an SWFDefineSoundTag string.
// //  TagID: 14

FreeMovieCompiler.prototype.packDefineSoundTag  = function( CharacterID, SoundFormat, SoundRate, SoundSize, SoundType, SoundSampleCount, SoundFile )
	{
		array_push(this.FMDebug, "packDefineSoundTag");
// #error_log("here--");
		var  TagID  =  14 ;

		var  DefineSoundTag   =  this.packnBits(SoundFormat, 4) ;
		DefineSoundTag += this.packnBits(SoundRate, 2) ;
		DefineSoundTag += this.packnBits(SoundSize, 1) ;
		DefineSoundTag += this.packnBits(SoundType, 1) ;

		DefineSoundTag   =  this.packBitValues(DefineSoundTag) ;

		DefineSoundTag   =  this.packUI16(CharacterID) + DefineSoundTag ;
		DefineSoundTag += this.packUI32(SoundSampleCount) ;

		var  file_handle  =  fopen(SoundFile, "r") ;
		var  file  =  fread(file_handle, filesize(SoundFile)) ;
		fclose(file_handle);

		if (SoundFormat == 2) {

			DefineSoundTag += this.packUI16(10) + file ;
		}

		var  TagLength  =  strlen(DefineSoundTag) ;

		this.AutoSetSWFVersion(1);

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + DefineSoundTag ;

		array_pop(this.FMDebug);

	}

// //--------------------------------------------------
// //  string packStartSoundTag(integer CharacterID,
// //                                string SOUNDINFO)
// //  returns an SWFDefineSoundTag string.
// //  TagID: 15

FreeMovieCompiler.prototype.packStartSoundTag  = function( CharacterID, SOUNDINFO )
	{
		array_push(this.FMDebug, "packStartSoundTag");

		var  TagID  =  15 ;

		var  StartSoundTag  =  this.packUI16(CharacterID) + SOUNDINFO ;

		var  TagLength  =  strlen(StartSoundTag) ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + StartSoundTag ;

		array_pop(this.FMDebug);

	}

FreeMovieCompiler.prototype.packSoundStreadmingHeadTag  = function(  )
	{
		array_push(this.FMDebug, "packSoundStreamingHeadTag");
		array_pop(this.FMDebug);

	}

FreeMovieCompiler.prototype.packSoundStreamingHead2Tag  = function(  )
	{
		array_push(this.FMDebug, "packSoundStreamingHead2Tag");
		array_pop(this.FMDebug);

	}

FreeMovieCompiler.prototype.packSoundStreamBlockTag  = function(  )
	{
		array_push(this.FMDebug, "packSoundStreamBlockTag");
		array_pop(this.FMDebug);

	}

// //--------------------------------------------------
// //  string packDefineBitsLosslessTag(
// //              integer BitmapID, integer BitmapID,
// //       integer BitmapFormat, integer BitmapWidth,
// //                            integer BitmapHeight,
// //                    integer BitmapColorTableSize,
// //                            string ZlibBitmapData)
// //  return an SWF DefineBitsLossless tag string.
// //  TagID: 20

FreeMovieCompiler.prototype.packDefineBitsLosslessTag  = function( BitmapID, BitmapFormat, BitmapWidth, BitmapHeight, BitmapColorTableSize, ZlibBitmapData )
	{
		array_push(this.FMDebug, "packDefineBitsLosslessTag");

		var  TagID  =  20 ;

		var  BitmapID  =  this.packUI16(BitmapID) ;
		var  BitmapWidth  =  this.packUI16(BitmapWidth) ;
		var  BitmapHeight  =  this.packUI16(BitmapHeight) ;

		switch (BitmapFormat) {

			case 3:

				var  BitmapColorTableSize  =  this.packUI8(BitmapColorTableSize) ;
				break;

			case 4:

				BitmapColorTableSize  =  this.packUI16(BitmapColorTableSize) ;
				break;

			case 5:

				BitmapColorTableSize  =  this.packUI32(BitmapColorTableSize) ;
				break;

			default:

				this.FMError("packDefineBitsLosslessTag illegal argument (BitmapFormat)");
		}

		var  BitmapFormat  =  this.packUI8(BitmapFormat) ;

		var  TagLength  =  strlen(BitmapID + BitmapFormat + BitmapWidth + BitmapHeight + BitmapColorTableSize + ZlibBitmapData) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + BitmapID + BitmapFormat + BitmapWidth + BitmapHeight + BitmapColorTableSize + ZlibBitmapData ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packDefineBitsJPEG2Tag(integer BitmapID,
// //                       string BitmapJPEGEncoding,
// //                           string BitmapJPEGImage)
// //  return an SWF DefineBitsJPEG2 tag string.
// //  TagID: 21

FreeMovieCompiler.prototype.packDefineBitsJPEG2Tag  = function( BitmapID, BitmapJPEGEncoding, BitmapJPEGImage )
	{
		array_push(this.FMDebug, "packDefineBitsJPEG2Tag");

		var  TagID  =  21 ;

		var  BitmapID  =  this.packUI16(BitmapID) ;

		var  TagLength  =  strlen(BitmapID + BitmapJPEGEncoding + BitmapJPEGImage) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + BitmapID + BitmapJPEGEncoding + BitmapJPEGImage ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  null packDefineShapeTag2(integer ShapeID,
// //        string ShapeBounds, string SHAPEWITHSTYLE)
// //  returns an SWF DefineShapeTag string.
// //  TagID: 22

FreeMovieCompiler.prototype.packDefineShape2Tag  = function( ShapeID, ShapeBounds, SHAPEWITHSTYLE )
	{
		array_push(this.FMDebug, "packDefineShape2Tag");

		var  TagID  =  22 ;

		var  DefineShapeTag  =  this.packUI16(ShapeID) + ShapeBounds + SHAPEWITHSTYLE ;

		var  TagLength  =  strlen(DefineShapeTag) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + DefineShapeTag ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packProtectTag(string Password)
// //  returns an SWF Protect tag string.
// //  TagID: 24

FreeMovieCompiler.prototype.packProtectTag  = function( Password )
	{
		array_push(this.FMDebug, "packProtectTag");

		var  TagID  =  24 ;

		if (!(Password == "")) {

			var  Password  =  this.packSTRING(bin2hex(mhash(MHASH_MD5, Password))) ;
		}

		var  TagLength  =  strlen(Password) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + Label ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packPlaceObject2Tag(integer CharacterID,
// //     integer Depth, string MATRIX, string CXFORM,
// //     string MATRIX, string CXFORM, integer Ratio,
// //                  string Name, string ClipActions)
// //  return an SWF PlaceObject2 tag string.
// //  TagID: 26

FreeMovieCompiler.prototype.packPlaceObject2Tag  = function( PlaceFlagMove, PlaceFlagHasCharacter, CharacterID, Depth, MATRIX, CXFORM, Ratio, Name, ClipActions )
	{
		array_push(this.FMDebug, "packPlaceObject2Tag");

		var  TagID  =  26 ;

		var  PlaceFlagHasClipActions  =  "0" ;
		var  PlaceFlagReserved  =  "0" ;
		var  PlaceFlagHasName  =  "0" ;
		var  PlaceFlagHasRatio  =  "0" ;
		var  PlaceFlagHasColorTransform  =  "0" ;
		var  PlaceFlagHasMatrix  =  "0" ;

		var  payload  =  "" ;

		if (PlaceFlagMove) {

			var  PlaceFlagMove  =  "1" ;

		} else {

			PlaceFlagMove  =  "0" ;
		}


		if ((PlaceFlagHasCharacter) && (CharacterID != null)) {

			var  PlaceFlagHasCharacter  =  "1" ;
			payload += this.packUI16(CharacterID) ;

		} else {

			PlaceFlagHasCharacter  =  "0" ;
		}

		if (!(MATRIX == "")) {

			PlaceFlagHasMatrix  =  "1" ;
			payload += MATRIX ;
		}

		if (!(CXFORM == "")) {

			PlaceFlagHasColorTransform  =  "1" ;
			payload += CXFORM ;
		}

		if (!(Ratio == NULL)) {

			PlaceFlagHasRatio  =  "1" ;
			payload += this.packUI16(Ratio) ;
		}

		if (!(Name == NULL)) {

			PlaceFlagHasName  =  "1" ;
			payload += this.packSTRING(Name) ;
		}

		if (!(ClipActions == NULL)) {

			PlaceFlagHasClipActions  =  "1" ;
			payload += ClipActions ;
		}

		var  PlaceFlags  =  PlaceFlagHasClipActions + PlaceFlagReserved + PlaceFlagHasName + PlaceFlagHasRatio + PlaceFlagHasColorTransform + PlaceFlagHasMatrix + PlaceFlagHasCharacter + PlaceFlagMove ;

		var  payload   =  this.packBitValues(PlaceFlags) + this.packUI16(Depth)+ payload ;

		var  TagLength  =  strlen(payload) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + payload ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packRemoveObject2Tag(integer Depth)
// //  returns an SWF RemoveObject2 tag string.
// //  TagID: 28

FreeMovieCompiler.prototype.packRemoveObject2Tag  = function( Depth )
	{
		array_push(this.FMDebug, "packRemoveObject2Tag");

		var  TagID  =  28 ;

		var  Depth  =  this.packUI16(Depth) ;

		var  TagLength  =  strlen(Depth) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + Depth ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  null packDefineShapeTag3(integer ShapeID,
// //        string ShapeBounds, string SHAPEWITHSTYLE)
// //  returns an SWF DefineShapeTag string.
// //  TagID: 32

FreeMovieCompiler.prototype.packDefineShape3Tag  = function( ShapeID, ShapeBounds, SHAPEWITHSTYLE )
	{
		array_push(this.FMDebug, "packDefineShape3Tag");

		var  TagID  =  32 ;

		var  DefineShapeTag  =  this.packUI16(ShapeID) + ShapeBounds + SHAPEWITHSTYLE ;

		var  TagLength  =  strlen(DefineShapeTag) ;

		this.AutoSetSWFVersion(1);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + DefineShapeTag ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packDefineBitsJPEG3Tag(integer BitmapID,
// //                       string BitmapJPEGEncoding,
// //   string BitmapJPEGImage, string BitmapAlphaData)
// //  return an SWF DefineBitsJPEG3 tag string.
// //  TagID: 35

FreeMovieCompiler.prototype.packDefineBitsJPEG3Tag  = function( BitmapID, BitmapJPEGEncoding, BitmapJPEGImage, BitmapAlphaData )
	{
		array_push(this.FMDebug, "packDefineBitsJPEG3Tag");

		var  TagID  =  35 ;
		var  BitmapID  =  this.packUI16(BitmapID) ;
		var  Offset  =  this.packUI32(strlen(BitmapJPEGEncoding + BitmapJPEGImage)) ;
		var  TagLength  =  strlen(BitmapID + Offset + BitmapJPEGEncoding + BitmapJPEGImage + BitmapAlphaData) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + BitmapID + Offset + BitmapJPEGEncoding + BitmapJPEGImage + BitmapAlphaData ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packDefineBitsLossless2Tag(
// //              integer BitmapID, integer BitmapID,
// //       integer BitmapFormat, integer BitmapWidth,
// //                            integer BitmapHeight,
// //                    integer BitmapColorTableSize,
// //                            string ZlibBitmapData)
// //  return an SWF DefineBitsLossless2 tag string.
// //  TagID: 36

FreeMovieCompiler.prototype.packDefineBitsLossless2Tag  = function( BitmapID, BitmapFormat, BitmapWidth, BitmapHeight, BitmapColorTableSize, ZlibBitmapData2 )
	{
		array_push(this.FMDebug, "packDefineBitsLossless2Tag");

		var  TagID  =  36 ;

		var  BitmapID  =  this.packUI16(BitmapID) ;
		var  BitmapWidth  =  this.packUI16(BitmapWidth) ;
		var  BitmapHeight  =  this.packUI16(BitmapHeight) ;

		switch (BitmapFormat) {

			case 3:

				var  BitmapColorTableSize  =  this.packUI8(BitmapColorTableSize) ;
				break;

			case 4:

				BitmapColorTableSize  =  this.packUI16(BitmapColorTableSize) ;
				break;

			case 5:

				BitmapColorTableSize  =  this.packUI32(BitmapColorTableSize) ;
				break;

			default:

				this.FMError("packDefineBitsLosslessTag illegal argument (BitmapFormat)");
		}

		var  BitmapFormat  =  this.packUI8(BitmapFormat) ;

		var  TagLength  =  strlen(BitmapID + BitmapFormat + BitmapWidth + BitmapHeight + BitmapColorTableSize + ZlibBitmapData2) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + BitmapID + BitmapFormat + BitmapWidth + BitmapHeight + BitmapColorTableSize + ZlibBitmapData2 ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packFrameLabelTag(string Label)
// //  returns an SWF FrameLabel tag string.
// //  TagID: 43

FreeMovieCompiler.prototype.packFrameLabelTag  = function( Label )
	{
		array_push(this.FMDebug, "packFrameLabelTag");

		var  TagID  =  43 ;
		var  Label  =  this.packSTRING(Label) ;
		var  TagLength  =  strlen(Label) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + Label ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  null packDefineMorphShapeTag(integer ShapeID,
// //     string FromShapeBounds, stringToShapeBounds,
// //                          string MorphFillStyles,
// //        string MorphLineStyles, string FromShape,
// //                                   string ToShape)
// //  returns an SWF DefineMorphShapeTag string.
// //  TagID: 46

FreeMovieCompiler.prototype.packDefineMorphShapeTag  = function( ShapeID, FromShapeBounds, ToShapeBounds, MorphFillStyles, MorphLineStyles, FromShape, ToShape )
	{
		array_push(this.FMDebug, "packDefineMorphShapeTag");
		var  TagID  =  46 ;

		var  DefineMorphShapeTag  =  this.packUI16(ShapeID) + FromShapeBounds + ToShapeBounds + this.packUI32(strlen(MorphFillStyles + MorphLineStyles + FromShape)) + MorphFillStyles + MorphLineStyles + FromShape + ToShape ;

		var  TagLength  =  strlen(DefineMorphShapeTag) ;

		this.AutoSetSWFVersion(5);
		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + DefineMorphShapeTag ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packExportAssetsTag(string AssetList)
// //  returns an SWF EnableDebugger tag string.
// //  TagID: 56

FreeMovieCompiler.prototype.packExportAssetsTag  = function( AssetList )
	{
		array_push(this.FMDebug, "packExportAssetsTag");

		var  TagID  =  56 ;

		var  AssetCount  =  substr_count(AssetList, String.fromCharCode(0)) ;

		var  TagLength  =  strlen(AssetCount + AssetList) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + AssetCount + AssetList ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packImportAssetsTag(string URL,
// //                                 string AssetList)
// //  returns an SWF EnableDebugger tag string.
// //  TagID: 57

FreeMovieCompiler.prototype.packImportAssetsTag  = function( URL, AssetList )
	{
		array_push(this.FMDebug, "packImportAssetsTag");

		var  TagID  =  57 ;

		var  URL  =  this.packSTRING(URL) ;

		var  AssetCount  =  substr_count(AssetList, String.fromCharCode(0)) - 1 ;

		var  TagLength  =  strlen(URL, AssetCount + AssetList) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + URL + AssetCount + AssetList ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packEnableDebuggerTag(string Password)
// //  returns an SWF EnableDebugger tag string.
// //  TagID: 58

FreeMovieCompiler.prototype.packtectEnableDebuggerTag  = function( Password )
	{
		array_push(this.FMDebug, "packEnableDebuggerTag");

		var  TagID  =  58 ;

		if (!(Password == "")) {

			var  Password  =  this.packSTRING(bin2hex(mhash(MHASH_MD5, Password))) ;
		}

		var  TagLength  =  strlen(Password) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + Label ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packDefineBitsPtrTag(integer Pointer)
// //  returns an SWF DefineBitsPtr tag string.
// //  TagID:1023

FreeMovieCompiler.prototype.packDefineBitsPtrTag  = function( Pointer )
	{
		array_push(this.FMDebug, "packDefineBitsPtrTag");

		var  TagID  =  1023 ;

		var  TagLength  =  strlen(this.packUI32(Pointer)) ;

		this.MovieData += this.packRECORDHEADER(TagID, TagLength) + Label ;

		array_pop(this.FMDebug);
	}

// //--------------------------------------------------
// //  string packMacromediaFlashSWFHeader()
// //  returns the Macromedia Flash SWF Header string.

FreeMovieCompiler.prototype.packMacromediaFlashSWFHeader  = function(  )
	{
		array_push(this.FMDebug, "packMacromediaFlashSWFHeader");

		var  HeaderLength  =  21 ;
		var  atom   =  "FWS" ;
		atom += this.packUI8(/*(int)*/this.SWFVersion) ;
		atom += this.packUI32(HeaderLength + strlen(this.MovieData)) ;

		var  Xmin  =  /*(int)*/this.FrameSize["Xmin"] ;
		var  Xmax  =  /*(int)*/this.FrameSize["Xmax"] ;
		var  Ymin  =  /*(int)*/this.FrameSize["Ymin"] ;
		var  Ymax  =  /*(int)*/this.FrameSize["Ymax"] ;

		if (Math.min(Xmax, Ymax) < 360) {

			this.FMError("packMacromediaFlashSWFHeader movie frame too small");

		}

		if (Math.max(Xmax, Ymax) > 57600) {

			this.FMError("packMacromediaFlashSWFHeader movie frame too large");

		}

		Xmin  =  this.packUBchunk(Xmin) ;
		Xmax  =  this.packUBchunk(Xmax) ;
		Ymin  =  this.packUBchunk(Ymin) ;
		Ymax  =  this.packUBchunk(Ymax) ;

		var  nBits  =  16 ;

		Xmin  =  str_repeat("0", (nBits - strlen(Xmin))) + Xmin ;
		Xmax  =  str_repeat("0", (nBits - strlen(Xmax))) + Xmax ;
		Ymin  =  str_repeat("0", (nBits - strlen(Ymin))) + Ymin ;
		Ymax  =  str_repeat("0", (nBits - strlen(Ymax))) + Ymax ;

		var  RECT  =  this.packnBits(nBits, 5) + Xmin + Xmax + Ymin + Ymax ;

		atom += this.packBitValues(RECT) ;
		atom += this.packFIXED8(/*(float)*/this.FrameRate) ;
		atom += this.packUI16(/*(int)*/this.FrameCounter) ;

this.MovieData  =  atom + this.MovieData ; //TYPE A.b

		array_pop(this.FMDebug);
	}

//KILLENDCLASS }
//END

