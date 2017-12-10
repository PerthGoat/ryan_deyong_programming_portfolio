use strict;
use warnings;
use v5;

use IO::Socket;
use IO::Select;

use feature 'say';

# the path of the folder that holds the templates
my $base_folder_path = 'canned/';

# templating engine, makes dynamic loading of repeated code fastesr
# takes a string, returns a string + whatever needs to be loaded
sub template_engine {
    my $str = shift;
    
    while(1) {
        my ($result) = ($str =~ /%%(.*?)%%/);
        if(not defined $result) { # if result is empty, we are done templating
            return $str;
        }
        say "Page is requiring template $result, loading..";
        my $path = $base_folder_path . $result;
        if(-e $path) { # if the file exists
            local $/ = undef; # read entire file
            open my $fh, '<', $path or die "Can't open file!";
            my $document = <$fh>;
            close $fh;
            $str =~ s/%%(.*?)%%/$document/;
        } else {
            say "Tried to load $path, doesn't exist!";
            $str =~ s/%%(.*?)%%/TEMPLATE_LOAD_ERROR/;
        }
    }
}

# takes a socket and a filename
# sends out a file
sub send_file {
    my ($filename, $client_socket) = @_;
    
    $filename = substr $filename, 1;
    
    # get basic client information
    my $client_address = $client_socket->peerhost();
    my $client_port = $client_socket->peerport();
    
    my $content_string = "";
    
    if(-e $filename) {
        say "Client $client_address:$client_port requested $filename, which exists. Sending..";
        $content_string = "HTTP/1.1 200 OK\n";
    } else {
        say "Client $client_address:$client_port requested file $filename, which does not exist, sending 404 to client..";
        $content_string = "HTTP/1.1 404 Not Found\nRefresh:0; url=/error_pages/404.html\nConnection: Closed\n";
        $client_socket->send($content_string);
        return;
    }
    
    my $filesize = -s $filename; # this is content length
    
    $content_string .= "Content-Type: text/html; charset=ascii\n";
    $content_string .= "Connection: Closed\n";
    
    # open and read in the entire file we want to send to RAM
    local $/ = undef;
    open my $fh, '<', $filename or die "Can't open file!";
    my $document = <$fh>;
    close $fh;
    
    $document = template_engine $document; # run the templating engine on the document
    
    $content_string .= ("Content-Length: " . (length $document) . "\n");
    
    $content_string .= ("\n" . $document);

    $client_socket->send($content_string);
}

my $server_host = '0.0.0.0';
my $server_port = 8080;

my $server = IO::Socket::INET->new(LocalHost => '0.0.0.0',
                                   LocalPort => $server_port,
                                   Proto => 'tcp',
                                   Listen => 5,
                                   Reuse => 1) or die "Can't open socket on port $server_port";

say "Server waiting for clients on port $server_port..";

while(1) {
    my $client_socket = $server->accept();
    my $client_address = $client_socket->peerhost();
    my $client_port = $client_socket->peerport();
   
    say "Incoming connection from $client_address:$client_port";
   
    my $data = '';
    $client_socket->recv($data, 1024); # get the browser request
    # split it into lines, and extract the file it wants
    my @requestLines = split "\n", $data;
    my @request = split " ", $requestLines[0];
    if(scalar @request == 3 and $request[0] eq 'GET') {
        my $file = $request[1];
        
        if($file eq '/') { # this means the browser is looking for "index.html"
            send_file '/index.html', $client_socket
        } else { # otherwise it might be looking for anything
            send_file $file, $client_socket
        }
    } else {
        say "Client $client_address:$client_port gave an invalid request";
    }
   
    shutdown($client_socket, 1);
}

$server->close();
