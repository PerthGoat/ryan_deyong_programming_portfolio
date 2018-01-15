var pixels = [[]];
			  
var SCREEN_WIDTH = 15;
var SCREEN_HEIGHT = 5;

function setupDefault()
{
	//electron head
	pixels[2][2] = 1;
	//the wiring of the clock
	pixels[1][3] = 3;
	pixels[1][4] = 3;
	pixels[1][5] = 3;
	pixels[1][6] = 3;
	pixels[2][7] = 3;
	pixels[3][6] = 3;
	pixels[3][5] = 3;
	pixels[3][4] = 3;
	pixels[3][3] = 2;
	//leading wire
	pixels[2][8] = 3;
	pixels[2][9] = 3;
	//the wiring of the diode
	pixels[1][9] = 3;
	pixels[3][9] = 3;
	pixels[1][10] = 3;
	pixels[3][10] = 3;
	pixels[2][11] = 3;
	//leading wire
	pixels[2][12] = 3;
	pixels[2][13] = 3;
}

function setup()
{
	var y = 0;
	var pix = "";
	for(var i = 0;i < SCREEN_WIDTH * SCREEN_HEIGHT;i++)
	{
		if(i % SCREEN_WIDTH == 0 && i > 0)
		{
			y++;
			if(typeof pixels[y] === 'undefined')
			{
				pixels[y] = [];
			}
			pix += '<br>';
		}
		pix += '<span class="pixel" id=' + i + '></span>';
		pixels[y][i] = 0;
	}
	document.getElementById("scr").innerHTML = pix;
	setupDefault();
}
setup();

function getColor(n)
{
	switch(n)
	{
	case 0:
		return "black";
		break;
	case 1:
		return "blue";
		break;
	case 2:
		return "red";
		break;
	case 3:
		return "yellow";
		break;
	default:
		return "black";
		break;
	}
}

function refreshPixels()
{
	for(var x = 0;x < SCREEN_WIDTH;x++)
	{
		for(var y = 0;y < SCREEN_HEIGHT;y++)
		{
			document.getElementById(y * SCREEN_WIDTH + x).style.backgroundColor = getColor(pixels[y][x]);
		}
	}
}

function copyArr(arr)
{
	var newArray = [];
	
	for(var i = 0;i < arr.length;i++)
	{
		newArray[i] = arr[i].slice();
	}
	
	return newArray;
}

function step()
{
	refreshPixels();
	var newPixels = copyArr(pixels);
	for(var x = 0;x < SCREEN_WIDTH;x++)
	{
		for(var y = 0;y < SCREEN_HEIGHT;y++)
		{
			switch(pixels[y][x])
			{
			case 1:
				newPixels[y][x] = 2;
				break;
			case 2:
				newPixels[y][x] = 3;
				break;
			case 3:
				var c = 0;
				for(var i = -1;i <= 1;i++)
				{
					for(var o = -1;o <= 1;o++)
					{
						if(pixels[y + o][x + i] == 1)
						{
							c++;
						}
					}
				}
				if(c == 1 || c == 2)
				{
					newPixels[y][x] = 1;
				}
				break;
			default:
				break;
			}
		}
	}
	pixels = newPixels;
}

setInterval(step, 500);