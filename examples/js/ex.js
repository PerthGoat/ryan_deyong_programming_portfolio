var cube = [
        //front face
        [-1, -1, 1, 1],
        [1, -1, 1, 1],
        [1, 1, 1, 1],
        [-1, 1, 1, 1],
        //back face
        [-1, -1, -1, 1],
        [1, -1, -1, 1],
        [1, 1, -1, 1],
        [-1, 1, -1, 1],
];

var worldMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
];

var f = math.cot(1.047 / 2);

var zFar = 1.0;
var zNear = 0.01;

var perspectiveMatrix = [
            [f, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, (zFar + zNear) / (zNear - zFar), (2 * zFar * zNear) / (zNear - zFar)],
            [0, 0, -1, 0],
];

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//multiplies the master matrix by a translation matrix
function translate(x, y, z)
{
    translationMatrix = [
                        [1, 0, 0, x],
                        [0, 1, 0, y],
                        [0, 0, 1, z],
                        [0, 0, 0, 1]
    ];
    
    worldMatrix = math.multiply(translationMatrix, worldMatrix);
}

//rotates the master matrix on a chosen axis by theta
function rotate(x, y, z, theta)
{
    var rotationMatrix;
    if(x)
    {
        rotationMatrix = [
                        [1, 0, 0, 0],
                        [0, Math.cos(theta), -Math.sin(theta), 0],
                        [0, Math.sin(theta), Math.cos(theta), 0],
                        [0, 0, 0, 1]
        ];
        
        worldMatrix = math.multiply(rotationMatrix, worldMatrix);
    }
    if(y)
    {
        rotationMatrix = [
                        [Math.cos(theta), 0, Math.sin(theta), 0],
                        [0, 1, 0, 0],
                        [-Math.sin(theta), 0, Math.cos(theta), 0],
                        [0, 0, 0, 1]
        ];
        
        worldMatrix = math.multiply(rotationMatrix, worldMatrix);
    }
    if(z)
    {
        rotationMatrix = [
                        [Math.cos(theta), -Math.sin(theta), 0, 0],
                        [Math.sin(theta), Math.cos(theta), 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1]
        ];
        
        worldMatrix = math.multiply(rotationMatrix, worldMatrix);
    }
}

//multiplies the master matrix by a scale matrix
function scale(x, y, z)
{
    scaleMatrix = [
                [x, 0, 0, 0],
                [0, y, 0, 0],
                [0, 0, z, 0],
                [0, 0, 0, 1]
    ];
    
    worldMatrix = math.multiply(scaleMatrix, worldMatrix);
}

translate(1, 0, -3);

for(var i = 0;i < cube.length;i++)
{
    cube[i] = math.multiply(worldMatrix, cube[i]);
    cube[i] = math.multiply(perspectiveMatrix, cube[i]);
    cube[i] = math.divide(cube[i], cube[i][3]);
    cube[i] = math.multiply(cube[i], 256);
    cube[i] = math.add(cube[i], 256);
}

//draw front face
ctx.beginPath();
ctx.moveTo(cube[0][0], cube[0][1]);
ctx.lineTo(cube[1][0], cube[1][1]);
ctx.lineTo(cube[2][0], cube[2][1]);
ctx.lineTo(cube[3][0], cube[3][1]);
ctx.lineTo(cube[0][0], cube[0][1]);
ctx.stroke();
//draws back face
ctx.beginPath();
ctx.moveTo(cube[4][0], cube[4][1]);
ctx.lineTo(cube[5][0], cube[5][1]);
ctx.lineTo(cube[6][0], cube[6][1]);
ctx.lineTo(cube[7][0], cube[7][1]);
ctx.lineTo(cube[4][0], cube[4][1]);
ctx.stroke();
//connects front face to back face
ctx.beginPath();
ctx.moveTo(cube[0][0], cube[0][1]);
ctx.lineTo(cube[4][0], cube[4][1]);
ctx.moveTo(cube[1][0], cube[1][1]);
ctx.lineTo(cube[5][0], cube[5][1]);
ctx.moveTo(cube[2][0], cube[2][1]);
ctx.lineTo(cube[6][0], cube[6][1]);
ctx.moveTo(cube[3][0], cube[3][1]);
ctx.lineTo(cube[7][0], cube[7][1]);
ctx.stroke();