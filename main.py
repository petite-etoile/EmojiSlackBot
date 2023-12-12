from line_stamp_util import get_line_store_url, get_line_stamp_urls, save_line_stamps, download_image

def main():
    line_store_url = get_line_store_url()
    line_stamp_urls = get_line_stamp_urls(line_store_url)
    save_line_stamps(line_stamp_urls)

if __name__ == '__main__':
    main()